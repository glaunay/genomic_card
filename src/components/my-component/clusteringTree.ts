/**
* Return the total number of sgRNA occurences given a dictionary
* @param {Object} sequences dictionary of sgRNA with the list of coordinates
* @returns {Number} the total number of sgRNA
*/
function nbWord(sequences: Object):number {
  // number of total sgRNA
  let sum: number=0;
  for (var i in sequences) {
    // length of list of coordinates for each sgRNA
    sum += sequences[i].length;
  }
  return sum;
}

/**
* Return the level of the section to create a beautyful sunburst
* @param {Number} nivMax Maximal level of the sunburst
* @param {Number} nivCurr Maximal level of the sunburst
* @param {Number} nbSec Number of section by circle
* @returns {Number} the correct level for the section to display a sunburst without null sections
*/
function updateNiv(nivMax: number, nivCurr: number, nbSec: number):number {
  let b = nivMax - nivCurr;
  return nivMax * Math.pow(nbSec, b);
}

/**
* Set the level of all node to create a sunburst
* @param {Array} children Maximal level of the sunburst
* @param {Number} nivMax Maximal level of the sunburst
* @param {Number} nbSec Number of section by circle
*/
function setNiv(children:Array<Object>, nivMax:number, nbSec:number):void {
  for (var i in children){
    if (children[i].hasOwnProperty('niv')) {
      if (children[i]['niv'] < nivMax){
        children[i]['niv'] = updateNiv(nivMax, children[i]['niv'], nbSec)
      }
    } else {
      setNiv(children[i]['children'], nivMax, nbSec)
    }
  }
}


export class TreeClustering {
  // the root of the tree
  root: Object;
  /**
  * Set the level of all node to create a sunburst
  * @param {number} sizeGenome Genome size
  * @param {Object} sequences Dictionary of sequences with their coordinates
  * @param {number} nbSec Number of section by circle
  * @param {number} minWord Minimal word by section
  */
  constructor(sizeGenome: number, sequences: Object, nbSec: number, minWord: number) {
    const [children, nivMax] = this.constructTree(sizeGenome, sequences, nbSec, minWord, 1, 0);
    let totalWeight = 0;
    console.log('NIVEAU MAX : ' + nivMax);
    children.forEach(child => totalWeight += child.weight);
    this.root = {'min': 0, 'max': sizeGenome, 'children': children, 'weight': totalWeight};
    setNiv(this.root['children'], nivMax, nbSec)
  }

  /**
  * Find coordinates of sequences inside a section given
  * @param {number} min Maximal level of the sunburst
  * @param {number} max Maximal level of the sunburst
  * @param {Object} sequences Dictionary of sequences with their coordinates
  * @returns {Object} Dictionary of sequences with their coordinates which are inside the sector
  defined by min and max arguments
  */
  find(min:number, max:number, sequences:Object):Object {
    // sequences in the sector
    let sequencesIn:Object = {};
    for (var seq in sequences) {
      // coordinates of the sequence in the sector
      let tmpCoord: string[] = []
      sequences[seq].forEach(coord => {
        // retrieve the start position of the sgRNA
        let start = (/\(([0-9]*),/.exec(coord)[1] as unknown as number);
        // check if this position is in the sector
        if (start >min && start < max) {
          tmpCoord.push(coord);
        }
      })
      // if some coordinates are in the sector, create a key for this list
      if (tmpCoord.toString() != '') sequencesIn[seq] = tmpCoord;
    }
    return sequencesIn;
  }

  /**
  * Set the level of all node to create a sunburst
  * @param {number} sizeSector Genome size
  * @param {Object} sequences Dictionary of sequences with their coordinates
  * @param {number} nbSec Number of section by circle
  * @param {number} minWord Minimal word excepted
  * @param {number} niv Current level
  * @param {number} minPos The satrt coordinate of the section
  * @returns {Array} A list of children of the node and the maximal level
  */
  constructTree(sizeSector: number, sequences: Object, nbSec: number, minWord: number, niv:number, minPos: number):Array<any> {
    // calcul interval
    let sizeSubSector: number = sizeSector / nbSec;
    let listChildren = [];
    let nivMax = niv;
    for (var i=0; i < nbSec; i++) {
      // the last sector takes all last position
      let max = (i != nbSec -1) ? (i+1) * sizeSubSector + minPos : sizeSector + 1 + minPos;
      let min = i * sizeSubSector + minPos;
      // find sequences in the sector
      let sequencesLeaves = this.find(min, max, sequences);
      // if the number of sequences in the sector is < to the minWord, then children are sequences else
      // it's a node
      let [children, nivDepth] = (nbWord(sequencesLeaves) < minWord) ? [sequencesLeaves, 1] : this.constructTree(max - min, sequencesLeaves, nbSec, minWord, niv+1, min);
      if(nivDepth > nivMax) nivMax = nivDepth;
      if(nbWord(sequencesLeaves) < minWord) {
        listChildren.push({'min': min, 'max': max, 'children': children, 'weight': nbWord(sequencesLeaves), 'niv': niv});
      }else{
        listChildren.push({'min': min, 'max': max, 'children': children, 'weight': nbWord(sequencesLeaves)});
      }

    }
    return [listChildren, nivMax];
  }

}
