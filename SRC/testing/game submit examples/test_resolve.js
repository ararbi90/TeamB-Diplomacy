
const fs = require('fs');
let dir = "/Users/mjscheid/Desktop/475/Diplomancy/CurrentWorkingVersion/TeamB-Diplomacy/SRC/testing/";
let filename = "ruleDiagramOrders.json";
let raw = fs.readFileSync(dir+filename);
let rule_diagram_orders = JSON.parse(raw);

//console.log("full order object" + JSON.stringify(rule_diagram_orders,null,1));


// do a for each over rule_diagram_orders to test all diagrams
let diagram_1 = rule_diagram_orders[0];
//console.log("diagram 1 object" + JSON.stringify(diagram_1,null,1));
//keys [ 'submissions', 'actual', 'predicted', 'diagram' ]
console.log(diagram_1.diagram)
console.log(diagram_1.actual)
console.log(diagram_1.predicted)
console.log(diagram_1.submissions)









