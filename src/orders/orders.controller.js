const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
//list
const list = (req, res) => {
  res.json({ data: orders });
};

//validation

//(validate that new order has deliverTo, mobileNumber, and dishes fields)
const allFields = (req, res, next) => {
  const { data: {deliverTo, mobileNumber, dishes} = {} } = req.body;
  const requiredFields = ['deliverTo','mobileNumber', 'dishes'];
  if (!req.body.data[field]){
      return next ({ status: 400, message: 'Order must include a ${field}'})};
  next(); };

//(validate that dishes property is NOT an array and the order must include at least one dish)
const validDish = (req, res, next) =>{
  if (dishes.length === 0 || !Array.isArray(dishes))
  return next({
    status: 400,
    message: 'Order must include at least one dish',
  });
  res.locals.validOrder = req.body;
  next();
  };

//(validate a dish quantity property is missing	Dish ${index} must have a quantity that is an integer greater than 0, is zero or less, or is not an integer)
const checkDishes = (req, res, next) => {
  const dishes = res.locals.data.dishes; //takes the info from validDish
  dishes.forEach((dish, index) => {
    if (
      !dish.quantity ||
      dish.quantity <= 0 ||
      typeof dish.quantity !== 'number'
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  next();
};

//(validate order Id exists)
const orderFound = (req, res, next) => {
  const found = orders.find((order) => order.id === req.params.orderId);
  if (!found)
    return next({
      status: 404,
      message: `Order id: ${req.params.orderId} not found.`,
    });
  res.locals.order = found;
  next();
};

//(validate status)
const validStatus = (req, res, next) => {
  const { data: { status }} = req.body;
  if (!status || status === 'invalid')
    return next({
      status: 400,
      message:
        'Order must have a status of pending, preparing, out-for-delivery, delivered',
    });
  if (status === 'delivered')
    return next({
      status: 400,
      message: 'A delivered order cannot be changed',
    });
  next();
};

//create
const create = (req, res, next) => {
  const id = nextId();
  const newOrder = { ...req.body.data, id };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

//read
const read = (req, res, next) => {
  res.json({ data: res.locals.order });
};


//update
const update = (req, res, next) => {
  let orderIndex = orders.index(res.locals.order);
  if (req.body.data.id && req.body.data.id !== orders[index].id)
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${req.body.data.id}, Route: ${orders[index].id}`,
    });
  orders[orderIndex] = { ...req.body.data, id: orders[orderIndex].id };
  res.json({ data: orders[orderIndex] });
};





//delete


module.exports = {
  list};
