function nbWord(sequences: Object) {
  let sum: number=0;
  for (var i in sequences) {
    sum += sequences[i].length;
  }
  return sum;
}

class tree {

  root: Object;

  constructor(sizeGenome: number, sequences: any, nbSec: number, minWord: number) {
    let children = this.constructTree(sizeGenome, sequences, nbSec, minWord);
    this.root = {'min': 0, 'max': sizeGenome, 'children': children};

  }

  find(min, max, sequences) {
    let tmpCoord: string[], sequencesIn:Object;
    for (var i in sequences) {
      sequences[i].forEach(coord => {
        let start = (/\(([0-9]*),/.exec(coord)[1] as unknown as number);
        if (start >min && start < max) {
          tmpCoord.push(coord);
        }
      })
      sequencesIn[sequences[i]] = tmpCoord;
    }
    return sequencesIn;
  }

  constructTree(sizeSector: number, sequences: Object, nbSec: number, minWord: number) {
    let sizeSubSector: number = sizeSector / nbSec;
    let listChildren;
    for (var i=0; i < nbSec; i++) {
      let max = (i == nbSec) ? (i+1) * sizeSubSector : sizeSector + 1;
      let min = i * sizeSubSector;
      let sequencesLeaves = this.find(min, max, sequences);
      let children = (nbWord(sequencesLeaves) < minWord) ? sequencesLeaves : this.constructTree(max - min, sequencesLeaves, nbSec, minWord);

      listChildren.push({'min': min, 'max': max, 'children': children, 'weight': nbWord(sequencesLeaves)});
    }
    return listChildren;
  }

}
