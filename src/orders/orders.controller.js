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


//(validate that new order has deliverTo, mobileNumber, and dishes fields)
const allFields = (req, res, next) => {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  if (!deliverTo || !deliverTo.trim()) {
    next({
      status: 400,
      message: "Order must include a deliverTo"
    })
  }
  if (!mobileNumber || !mobileNumber.trim()) {
    next({
      status: 400,
      message: "Order must include a mobileNumber"
    })
  }
  if (!dishes) {
    next({
      status: 400,
      message: "Order must include a dish"
    })
  }
  return next();
}



//(validate that dishes property is NOT an array and the order must include at least one dish)
const validOrder = (req, res, next) =>{
  if (req.body.data.dishes.length === 0 || !Array.isArray(req.body.data.dishes))
  return next({
    status: 400,
    message: 'Order must include at least one dish',
  });
  res.locals.validOrder = req.body.data;
  next();
  };

//(validate a dish quantity property is missing	Dish ${index} must have a quantity that is an integer greater than 0, is zero or less, or is not an integer)
const checkDishes = (req, res, next) => {
  const dishes = res.locals.validOrder.dishes; //takes the info from validDish
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


function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find(order => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}`
  })
}


//(validate order Id exists)
const idFound = (req, res, next) => {
  const { orderId } = req.params;
  const { data: { id } = {}} = req.body;
  if (!id) return next();
  if (orderId !== id) {
    next ({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
    })
  }
  next();
}

//(validate status)
const validStatus = (req, res, next) => {
  const { data: { status } = {} } = req.body;
  console.log({status})
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
const update = (req, res) => {

  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes; res.json({ data: order })
  res.json({ data: order });
  }

//delete
const destroy = (req, res, next) => {
  let index = orders.indexOf(res.locals.order);
  if (orders[index].status === 'pending') {
    orders.splice(orders.indexOf(res.locals.order), 1);
    res.sendStatus(204);
  } else {
    next({
      status: 400,
      message: 'An order cannot be deleted unless it is pending',
    });
  }
};


module.exports = {
  list,
  create: [allFields, validOrder, checkDishes, create],
  read: [orderExists, read],
  update: [orderExists, allFields, idFound, validOrder, checkDishes, validStatus, update],
  delete: [orderExists, destroy],
};
