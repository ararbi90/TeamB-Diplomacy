const fs = require('fs');

// run by using the command: node construct_order.js

// Readline question and answer example:
// Source: https://stackoverflow.com/questions/36540996/how-to-take-two-consecutive-input-with-the-readline-module-of-node-js
// Author: answer by jc1

const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// 
const file_question = () => {
  return new Promise((resolve, reject) => {
    rl.question('Enter the path/filename where to save the orders: ', (answer) => {
      resolve(answer);
    });
  });
}

// All orders
const username_question = () => {
  return new Promise((resolve, reject) => {
    rl.question('Enter username: ', (answer) => {
      resolve(answer);
    });
  });
}

// All orders
const gameId_question = () => {
  return new Promise((resolve, reject) => {
    rl.question('Enter gameID: ', (answer) => {
      resolve(answer);
    });
  });
}

// Optional
const new_order_question = () => {
  return new Promise((resolve, reject) => {
    rl.question('Enter 1 to add a new order \r\nEnter any other int/char to quit  ', (answer) => {
      if (answer == 1) {
        answer = true;
      } else {
        answer = false;
      }
      resolve(answer);
    });
  });
}

// All orders
const unit_type_question = () => {
  return new Promise((resolve, reject) => {
    rl.question('Enter unit_type: ', (answer) => {
      
      answer.toUpperCase();
      if (answer != "F" && answer != "A") {
        console.log("Invalid unit type. Changed to A");
        answer = "A";
      }

      resolve(answer);
    });
  });
}

// All orders
const current_zone_question = () => {
  return new Promise((resolve, reject) => {
    rl.question('Enter current_zone: ', (answer) => {
      resolve(answer);
    });
  });
}

// All orders
const move_type_question = () => {
  return new Promise((resolve, reject) => {
    rl.question('Enter move_type: ', (answer) => {

      // Change all invalid orders to holds, so they won't mess things up
      answer.toUpperCase();
      if (answer != "M" && answer != "H" && answer != "S" && answer != "C") {
        console.log("Invalid move type changed to hold");
        answer = "H";
      }

      resolve(answer);
    });
  });
}

// Move order only
const move_zone_question = () => {
  return new Promise((resolve, reject) => {
    rl.question('Enter move_zone: ', (answer) => {
      resolve(answer);
    });
  });
}

// Convoy or Support only
const initial_question = () => {
  return new Promise((resolve, reject) => {
    rl.question('Enter inital_location of Support or Convoy: ', (answer) => {
      resolve(answer);
    });
  });
}

// Convoy or Support
const final_question = () => {
  return new Promise((resolve, reject) => {
    rl.question('Enter final_location of Support or Convoy: ', (answer) => {
      resolve(answer);
    });
  });
}


const main = async () => {

  console.log("\n");

  let file = await file_question();
  let username = await username_question();
  let gameId = await  gameId_question();

  let order_list = [];

  // get new order
  let new_order_flag = true;
  while (new_order_flag) {

    let order = {};
    order.unit_type = await unit_type_question();
    order.current_zone = await current_zone_question();
    order.move_type = await move_type_question();

    if (order.move_type == "M") {
      order.move_zone = await move_zone_question();
    } else if (order.move_type == "H") {
      //console.log("H move");
    } else if (order.move_type == "S") {
      //console.log("S move");
      order.inital_support_zone = await initial_question();
      order.final_support_zone = await final_question();
    } else if (order.move_type == "C") {
      //console.log("C move");
      order.inital_convoy_zone = await initial_question();
      order.final_convoy_zone = await final_question();
    }
    
    new_order_flag = await new_order_question();
    order_list.push(order);
    console.log("\n");

  }


  let count = 0;
  order_list.forEach(order => {
    console.log("order[" + count + "]: " + JSON.stringify(order, null, 2));
    count++;
  });

  rl.close();

  let test_object = {};
  test_object.username = username;
  test_object.gameId = gameId;
  test_object.orders = order_list;

  file_body = JSON.stringify(test_object,null,1);
  
  fs.writeFile(file, file_body, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log(file + "saved");
  });


}

main();