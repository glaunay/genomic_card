![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# Genomic card

![example display](https://github.com/sophielem/genomic_card/blob/treeChart/docs/example.png)

## Usage
Need three mandatory properties and one optional. The optional is the *gene* property. If it's present, when you click on a section an event is emmitted with coordinates of gene and sgRNA inside this section.
Moreover, if you click on section, only sgRNA inside this section can be selected and others section become grey.

The script clusteringTree allow to create a clustering tree to display the sunburst.

```
min: position minimal
max: position maximal
children: array of children
weight: number of sgRNA
niv: number level to display sunburst
```

#### all_data
A dictionary of organisms selected in JSON format with their referencesn sgRNA on them and their coordinates which must match the regex : __[+-]\\([0-9]\*,[0-9]*\\)__

```JSON
{
  "Buchnera aphidicola (Cinara tujafilina) GCF_000217635.1":
  {"NC_015662.1":
    {"AAAACTCAAATGAATTGACGGGG":
      ["-(195725,195747)"],
    "AAACTCAAATGAATTGACGGGGG":
      ["-(195726,195748)"],
    "TCCCCACTGCTGCCTCCCGTAGG":
      ["+(506719,506741)", "+(559092,559114)", "+(660482,660504)", "-(2675645,2675667)", "-(2862879,2862901)", "-(2960561,2960583)"]
    }
  },
  "Aliivibrio wodanis GCF_000953695.1":
    {"NZ_LN554846.1":
      {"AAAACTCAAATGAATTGACGGGG":
        ["+(2675080,2675102)", "+(2862314,2862336)", "+(2959996,2960018)", "-(507284,507306)", "-(559657,559679)", "-(661047,661069)"]
      },
    "NZ_LN554847.1":
      {"AAAACTCAAATGAATTGACGGGG":
        ["+(894485,894507)"]
      }
    }
}
```

#### org_names
A string of organisms names selected seperated by "&".
```
"Enterobacter sp. 638 GCF_000016325.1&Candidatus Blochmannia vafer str. BVAF GCF_000185985.2"
```

#### gene
A dictionary object with organisms as keys and their references. Then, a list of dictionary with *start* and *end* keys to indicate coordinates of gene.
```JSON
{
  "Enterobacter sp. 638 GCF_000016325.1":
    {"NC_009436.1":
      [{"start": "255180", "end": "255599"}, {"start": "842680", "end": "843099"}, {"start": "3343077", "end": "3343496"}, {"start": "4024310", "end": "4024729"}, {"start": "4269724", "end": "4270143"}, {"start": "4360796", "end": "4361215"}, {"start": "4466539", "end": "4466958"}]
    },
  "Candidatus Blochmannia vafer str. BVAF GCF_000185985.2":
    {"NC_014909.2":
      [{"start": "626246", "end": "626664"}]
    }
}
```

#### diagonal_svg
The pixel number of the svg.

#### size
If no precise, all size are set to 4,518,734.
```JSON
{
  "Enterobacter sp. 638 GCF_000016325.1":
    {"NC_009436.1":100000},
  "Candidatus Blochmannia vafer str. BVAF GCF_000185985.2":
    {"NC_014909.2": 2000000}}
```

## Event
### Emit
* __changeOrgCard__ : sent the name of the organism selected

* __changeRefCard__ : sent the reference selected

* __changeSgrnaCard__ : sent the sgRNA selected

* __sgDataSection__ : sent : *allSgrna* --> dictionary of sgRNA with their coordinates in a list<br> *gene* --> a list of dictionary containing start and stop for genes

### Send
* __changeOrgCard__ : change the organism selected, find data associated to this organism and create a new representation

* __changeRefCard__ : change the reference selected, find data associated and create a new representation

* __changeSgrnaCard__ : represent sgRNA selected by a red vertical line around the circle

* __changeOrgRefSgrna__ : find name of the organism name and its reference in *axis* key and sgRNA selected in *sgrna* key. Find data associated and create a new representation

## Authors
Sophie LEMATRE

## Date
July 18 2019
