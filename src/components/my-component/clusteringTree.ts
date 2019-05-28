export function nbWord(sequences: Object) {
  let sum: number=0;
  for (var i in sequences) {
    sum += sequences[i].length;
  }
  // console.log(sum);
  // console.log(sequences);
  // console.log('**********************************************************');
  return sum;
}

export class TreeClustering {

  root: Object;

  constructor(sizeGenome: number, sequences: any, nbSec: number, minWord: number) {
    let children = this.constructTree(sizeGenome, sequences, nbSec, minWord, 0, 0);
    this.root = {'min': 0, 'max': sizeGenome, 'children': children};

  }

  find(min, max, sequences) {
    let sequencesIn:Object = {};
    for (var seq in sequences) {
      let tmpCoord: string[] = []
      sequences[seq].forEach(coord => {
        let start = (/\(([0-9]*),/.exec(coord)[1] as unknown as number);

        if (start >min && start < max) {
          tmpCoord.push(coord);
          // if (min != 0) console.log('MAX : ' + max + '  MIN : ' + min + '  START : ' + start);
        }
      })
      console.log(tmpCoord.toString() == '');
      if (tmpCoord.toString() != '') sequencesIn[seq] = tmpCoord;
    }
    console.log('ORIGIN ' + sequences);
    console.log(sequencesIn);
    return sequencesIn;
  }

  constructTree(sizeSector: number, sequences: Object, nbSec: number, minWord: number, niv, minPos: number) {
    let sizeSubSector: number = sizeSector / nbSec;
    console.log('$$$$$$$$$$$' + sizeSector);
    let listChildren = [];
    for (var i=0; i < nbSec; i++) {
      let max = (i != nbSec) ? (i+1) * sizeSubSector + minPos : sizeSector + 1 + minPos;
      let min = i * sizeSubSector + minPos;
      console.log("NIVEAU : " + niv)
      let sequencesLeaves = this.find(min, max, sequences);
      let children = (nbWord(sequencesLeaves) < minWord) ? sequencesLeaves : this.constructTree(max - min, sequencesLeaves, nbSec, minWord, niv+1, min);

      listChildren.push({'min': min, 'max': max, 'children': children, 'weight': nbWord(sequencesLeaves)});
    }
    return listChildren;
  }

}
