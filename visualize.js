allElements = document.getElementsByClassName("CleanView__kgResultTitle___1BMB3");
allGraph=""
for(let i=0;i<allElements.length;i++){
allChildNodes=allElements[i].childNodes[0].childNodes;
entity1="\""+allChildNodes[0].textContent+"\"";
relation=allChildNodes[1].textContent;
entity2="\""+allChildNodes[2].textContent+"\"";
if(relation!="COLOCATION"){
allGraph+=entity1+" -> "+entity2+" [label=\""+relation+"\"]\n"}}
console.log(allGraph)
