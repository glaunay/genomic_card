export function nbWord(sequences: Object) {
  // number of total sgRNA
  let sum: number=0;
  for (var i in sequences) {
    // length of list of coordinates for each sgRNA
    sum += sequences[i].length;
  }
  return sum;
}

export class TreeClustering {
  // the root of the tree
  root: Object;
  // Genome's size, dictionary of sequences with their coordinates, the number of sector,
  // the min number before represent it by reads
  constructor(sizeGenome: number, sequences: any, nbSec: number, minWord: number) {
    let children = this.constructTree(sizeGenome, sequences, nbSec, minWord, 1, 0);
    this.root = {'min': 0, 'max': sizeGenome, 'children': children};
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
    for (var i=0; i < nbSec; i++) {
      // the last sector takes all last position
      let max = (i != nbSec -1) ? (i+1) * sizeSubSector + minPos : sizeSector + 1 + minPos;
      let min = i * sizeSubSector + minPos;
      // find sequences in the sector
      let sequencesLeaves = this.find(min, max, sequences);
      // if the number of sequences in the sector is < to the minWord, then children are sequences else
      // it's a node
      let children = (nbWord(sequencesLeaves) < minWord) ? sequencesLeaves : this.constructTree(max - min, sequencesLeaves, nbSec, minWord, niv+1, min);

      listChildren.push({'min': min, 'max': max, 'children': children, 'weight': nbWord(sequencesLeaves)});
    }
    return listChildren;
  }

}
