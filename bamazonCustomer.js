var mysql = require("mysql");
var inquirer = require('inquirer');

let itemIDlist = [];
var chosenStockQuant;
var cost;
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    purchase();
});

rounder = x => {
    var cent = x * 100;
    var deci = cent - Math.floor(cent);
    if (deci === 0)
        return cent / 100;
    if (deci < 0.5)
        return Math.floor(cent) / 100;
    return Math.ceil(cent) / 100;
}

function purchase() {

    var query = "SELECT * FROM products";
    connection.query(query, function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            if (res[i].stock_quantity < 1) {
                continue;
            }
            itemIDlist.push(res[i]);
            // console.log("Product ID: " + res[i].item_id);
            // console.log("Product Name: " + res.product_name); 
            //res[i].position
        }
        console.log(itemIDlist);
        askForIdFunc();
    })
}

function askForIdFunc() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: "Please input the product id",
        validate: function (value) {
            if (isNaN(value) || value < 1 || value % 1 !== 0) {
                return false;
            }
            return true;
        }
    }, {
        name: "units",
        type: "input",
        message: "Please input the amount you would like to purchase",
        validate: function (value) {
            if (isNaN(value) || value < 1 || value % 1 !== 0) {
                return false;
            }
            return true;
        }
    }
    ]).then(res => {
        for (var i = 0; i < itemIDlist.length; i++) {
            //console.log(res.units)
            
            if (res.id == itemIDlist[i].item_id && res.units > itemIDlist[i].stock_quantity) {
                console.log("Insufficient quantity!");
                console.log("Order will not fullfilled")
                return;
            }
            if(res.id == itemIDlist[i].item_id ){
                chosenStockQuant = itemIDlist[i].stock_quantity;
                cost = itemIDlist[i].price;
            }
            
        }
        
        
        //console.log(chosenStockQuant);
        updateDb(res);
        //console.log(res);
    })
}

function updateDb(res) {
    var query = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
    connection.query(query, [chosenStockQuant - res.units, res.id], function (err, res) {
        if (err) throw err;
    });
    console.log("Total purchase cost is: " + rounder(cost) * res.units);
}

