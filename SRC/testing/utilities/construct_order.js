const fs = require('fs');

// run by using the command: node construct_order.js


// path and filename where you want to save the new orders
// Change the path/file name to a question
// let path = "~";
// let filename = "temp_file_name";
// let ext = ".txt";
//let file;
//let file_body = "file_body never changed";


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

// move order
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

// Move order
const move_zone_question = () => {
  return new Promise((resolve, reject) => {
    rl.question('Enter move_zone: ', (answer) => {
      resolve(answer);
    });
  });
}

// Convoy or Support
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

  // unit_type_question
  // current_zone_question
  // move_type_question
  // move_zone_question
  // inital_question
  // final_question

  let file = await file_question();

  let username = await username_question();
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
      console.log("H move");
    } else if (order.move_type == "S") {
      console.log("S move");
      order.inital_support_zone = await initial_question();
      order.final_support_zone = await final_question();
    } else if (order.move_type == "C") {
      console.log("C move");
      order.inital_convoy_zone = await initial_question();
      order.final_convoy_zone = await final_question();
    }

    new_order_flag = await new_order_question();
    order_list.push(order);

  }


  let count = 0;
  order_list.forEach(order => {
    console.log("order[" + count + "]: " + JSON.stringify(order, null, 2));
    count++;
  });

  rl.close();

  let test_object = {};
  test_object.username = username;
  test_object.order_list = order_list;

  // file_body = username+ " \n\n"+JSON.stringify(order_list,null,1);
  file_body = JSON.stringify(test_object,null,1);
  
  fs.writeFile(file, file_body, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log(file + "saved");
  });


}

main();