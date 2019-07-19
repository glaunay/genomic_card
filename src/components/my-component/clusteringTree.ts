function nbWord(sequences: Object) {
  // number of total sgRNA
  let sum: number=0;
  for (var i in sequences) {
    // length of list of coordinates for each sgRNA
    sum += sequences[i].length;
  }
  return sum;
}


function updateNiv(nivMax: number, nivCurr: number, nbSec: number) {
  let b = nivMax - nivCurr;
  return nivMax * Math.pow(nbSec, b);
}


function fname(children, nivMax, nbSec) {
  for (var i in children){
    if (children[i].hasOwnProperty('niv')) {
      if (children[i]['niv'] < nivMax){
        children[i]['niv'] = updateNiv(nivMax, children[i]['niv'], nbSec)
      }
    } else {
      fname(children[i]['children'], nivMax, nbSec)
    }
  }
}


export class TreeClustering {
  // the root of the tree
  root: Object;
  // Genome's size, dictionary of sequences with their coordinates, the number of sector,
  // the min number before represent it by reads
  constructor(sizeGenome: number, sequences: any, nbSec: number, minWord: number) {
    const [children, nivMax] = this.constructTree(sizeGenome, sequences, nbSec, minWord, 1, 0);
    let totalWeight = 0;
    console.log('NIVEAU MAX : ' + nivMax);
    children.forEach(child => totalWeight += child.weight);
    this.root = {'min': 0, 'max': sizeGenome, 'children': children, 'weight': totalWeight};
    fname(this.root['children'], nivMax, nbSec)


  }

  find(min, max, sequences) {
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

  constructTree(sizeSector: number, sequences: Object, nbSec: number, minWord: number, niv, minPos: number) {
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
