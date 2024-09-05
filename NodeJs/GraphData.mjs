import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, 'GraphData.json');

const readJSONFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
};

let Vertices = [];
let Edges = [];
let FolderCounter = 0;
let folderNames = [];
let isContainer = false;

function SetLabel(name) {
  if (isContainer == true) {
    return name + "(container)";
  }
  return name;
}

function findLabelVertexIndex(name) {
  return Vertices.findIndex(vertex => vertex.Label === name);
}

function GetFolderIndex(folderName) {
  let newItem;

  for (let item of folderNames) {
    if (item.Name === folderName) {
      return item.Index
    }
  }
  newItem = { Name: folderName, Index: ++FolderCounter };
  folderNames.push(newItem);
  return newItem.Index;
}

async function createGraphFromData() {
  Vertices = [];
  Edges = [];
  const folderVerticesMap = new Map();
  console.log('createGraphFromData');
  const jsonData = await readJSONFile(filePath);
  console.log("jason data is: ",jsonData);
  const verticesLookup = [];
  jsonData.forEach(vertex => {
    const folderIndex = GetFolderIndex(vertex.FolderName);
    const newVertex = { Label: vertex.ClassName, FolderIndex: folderIndex, degree: 0, methods: vertex.Methods };

    Vertices.push(newVertex);
    verticesLookup.push(vertex.ClassName);

    if (!folderVerticesMap.has(folderIndex)) {
      folderVerticesMap.set(folderIndex, []);
    }
    folderVerticesMap.get(folderIndex).push(newVertex);
  });
  console.log("Vertices");
  console.log(Vertices);
  console.log("verticesLookup");
  console.log(verticesLookup);

  jsonData.forEach(vertex => {
    const inhertageName = vertex.InheritsFrom;
    console.log(vertex.ClassName, "is heritage from" , vertex.InheritsFrom);
    if (inhertageName != null)
    {
    Edges.push({ From: vertex.ClassName, To: vertex.InheritsFrom, Label: "heritage" });
    
    }

    vertex.Compositions.forEach(Composition => {
      isContainer = false;
      if (Composition.startsWith("System.Collections.Generic.")) {
        isContainer = true;
        Composition = Composition.match(/<(.*)>/)[1];
      }
      Edges.push({ From: vertex.ClassName, To: Composition, Label: SetLabel("Composition") });
     
    });

    vertex.Aggregations.forEach(Aggregation => {
      isContainer = false;
      if (Aggregation.startsWith("System.Collections.Generic.")) {
        isContainer = true;
        Aggregation = Aggregation.match(/<(.*)>/)[1];
      }
      Edges.push({ From: vertex.ClassName, To: Aggregation, Label: SetLabel("Aggregation") });
     
    });

    vertex.NestedClasses.forEach(NestedClasse => {
      isContainer = false;
      if (NestedClasse.startsWith("System.Collections.Generic.")) {
        isContainer = true;
        NestedClasse = NestedClasse.match(/<(.*)>/)[1];
      }
        Edges.push({ From: vertex.ClassName, To: NestedClasse, Label: SetLabel("Nested") });
      
    });

    vertex.Usage.forEach(Usage1 => {
      isContainer = false;
      if (Usage1.startsWith("System.Collections.Generic.")) {
        isContainer = true;
        Usage1 = Usage.match(/<(.*)>/)[1];
      }
        Edges.push({ From: vertex.ClassName, To: Usage1, Label: SetLabel("Usage") });
      
    });

  });

  Edges.forEach(edge => {
    const fromIndex = findLabelVertexIndex(edge.From);
    const toIndex = findLabelVertexIndex(edge.To);
    if (fromIndex !== -1) {
      Vertices[fromIndex].degree++;
    }
    if (toIndex !== -1) {
      Vertices[toIndex].degree++;
    }
  });

  folderVerticesMap.forEach((vertices, folderIndex) => {
    vertices.sort((a, b) => b.degree - a.degree);
  }); ///

  console.log(Vertices);
  console.log(Edges);
  console.log("Folder Vertices Map:");
  console.log(folderVerticesMap);

  Vertices = [];
  folderVerticesMap.forEach((vertices, folderIndex) => {
    vertices.forEach(vertex => {
      Vertices.push(vertex);
    });
  });

  return { Vertices, Edges};
}

export {
  createGraphFromData,
};
