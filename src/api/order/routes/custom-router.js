
module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/order/customOrder',
        handler: 'api::order.order.customOrder', // or 'plugin::plugin-name.controllerName.functionName' for a plugin-specific controller
        
      },{
        method:"POST",
        path:"/order/create",
        handler:"api::order.order.create"
      }
    ],
  };