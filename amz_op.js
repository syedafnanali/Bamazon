let mysql = require('mysql');
let inquirer = require('inquirer');

connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'am_product'
});

var product_name, quantity, department, price, o_s_quantity;
//connect to the database
connection.connect(function (error) {
    if (error) {
        throw error;
    }
    admin_panel();
});

function admin_panel() {
    //display list of operations for the store admin
    inquirer.prompt([
        {
            type: "list",
            message: "Chose the operation:",
            choices: ["Add new product", "update product price", "Add to quantity product", "Check store", "Display by Top Sell Departments", "Sale product", "exit"],
            name: "menu"
        }
    ]).then(function (response) {
        switch (response.menu) {
            case "Add new product":
                inquirer.prompt([
                    {
                        message: 'Enter Product Name',
                        name: 'p_name'
                    }
                ]).then(function (res) {
                    if (res.p_name) {
                        product_name = res.p_name;
                        inquirer.prompt([
                            {
                                message: 'Enter Department Name',
                                name: 'dep_name'
                            }
                        ]).then(function (res) {
                            if (res.dep_name) {
                                department = res.dep_name;
                                inquirer.prompt([
                                    {
                                        message: 'Sale price',
                                        name: 'sale_price'
                                    }
                                ]).then(function (res) {
                                    if (res.sale_price) {
                                        price = res.sale_price;
                                        inquirer.prompt([
                                            {
                                                message: 'quantity',
                                                name: 'quantity'
                                            }
                                        ]).then(function (res) {
                                            if (res.quantity) {
                                                quantity = res.quantity;
                                                addNewProduct();
                                            }
                                        })
                                    }
                                })
                            }
                        });
                    }
                });
                break;
            case "update product price":
                inquirer.prompt([
                    {
                        message: 'Enter Product Name',
                        name: 'p_name'
                    }
                ]).then(function (res) {
                    if (res.p_name) {
                        product_name = res.p_name;
                        inquirer.prompt([
                            {
                                message: 'Sale price',
                                name: 'sale_price'
                            }
                        ]).then(function (res) {
                            if (res.sale_price) {
                                price = res.sale_price;
                                update_price();
                            }
                        })
                    }
                });
                break;
            case "Add to quantity product":
                inquirer.prompt([
                    {
                        message: 'Enter Product Name',
                        name: 'p_name'
                    }
                ]).then(function (res) {
                    if (res.p_name) {
                        get_old_quantity(res.p_name)
                        product_name = res.p_name;
                        inquirer.prompt([
                            {
                                message: 'quantity',
                                name: 'quantity'
                            }
                        ]).then(function (res) {
                            if (res.quantity) {
                                quantity = res.quantity;
                                add_quantity();
                            }
                        })
                    }
                });
                break;
            case "Check store":
                store();
                break;
            case "Display by Top Sell Departments":
                topSale();
                break;
            case "Sale product":
                inquirer.prompt([
                    {
                        message: 'Enter Product Name',
                        name: 'p_name'
                    }
                ]).then(function (res) {
                    if (res.p_name) {
                        get_old_quantity(res.p_name)
                        product_name = res.p_name;
                        inquirer.prompt([
                            {
                                message: 'quantity',
                                name: 'quantity'
                            }
                        ]).then(function (res) {
                            if (res.quantity) {
                                quantity = res.quantity;
                                sale_product();
                            }
                        })
                    }
                })
                break;
            case "exit":
                connection.end();
                process.exit(0);
                break;
        }
    })
}

function addNewProduct() {
    let prod_name = product_name;
    let dep = department;
    let pric = parseFloat(price);
    let quan = parseInt(quantity);
    connection.query(`INSERT INTO products(product_name,department_name,price,stock_quantity) VALUES('${prod_name}','${dep}',${pric},${quan})`, function (err) {
        if (err) throw err;
        console.log('new product saved');
        admin_panel();
    });
}

function update_price() {
    let prod_name = product_name;
    let pric = parseFloat(price);
    connection.query(`UPDATE products SET price= ${pric} WHERE product_name='${prod_name}'`, function (err) {
        if (err) throw err;
        console.log(' product price updated');
        admin_panel();
    });
}

function add_quantity() {
    let prod_name = product_name;
    let quan = parseInt(quantity);
    let old_quantity = o_s_quantity;
    let new_quantity = quan + old_quantity;
    connection.query(`UPDATE products SET stock_quantity= ${new_quantity} WHERE product_name='${prod_name}'`, function (err) {
        if (err) throw err;
        console.log(' product quantity added');
        admin_panel();
    });
}

function store() {
    connection.query(`
    SELECT department_name, SUM(stock_quantity) as Store
    FROM products 
    GROUP BY department_name
    `, function (err, res) {
            if (err) throw err;
            console.log('\n');
            console.table(res)
            admin_panel();
        })
}

function topSale() {
    connection.query(`SELECT * FROM products ORDER BY sale_quantity DESC`, function (err, res) {
        if (err) {
            throw err;
        }
        let products = [];

        res.forEach(el => {
            products.push({ department: el.department_name, quantity: el.stock_quantity, sale: el.sale_quantity, cost: el.cost, profit: el.profit });
        });
        console.log('\n');
        console.table(products);
        admin_panel();
    });
}

function sale_product() {
    let p_name = product_name;
    let quan = parseInt(quantity);
    let old_quantity = o_s_quantity;
    let new_quantity = old_quantity - quan;
    connection.query(`UPDATE products SET sale_quantity= ${quan},stock_quantity=${new_quantity} WHERE product_name='${p_name}'`, function (err) {
        if (err) throw err;
        console.log('done sale');
        admin_panel();
    });
}

function get_old_quantity(prod_name) {

    connection.query(`SELECT * FROM products WHERE product_name='${prod_name}'`, function (err, res) {
        if (err) throw err;
        o_s_quantity = res[0].stock_quantity;
    });
}