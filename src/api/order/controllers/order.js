'use strict';

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
module.exports = createCoreController('api::order.order', ({ strapi })=> ({
    async customOrder(ctx) {
        try {
        const bodyData=ctx.body;
        const entries=await strapi.entityService.findMany("api::product.product",{
            fields: ['title'],
            limit: 2
            
        })
        return {data:entries}
        } catch (err) {
          ctx.body = err;
        }
      },

    async create(ctx){
        try{           

            const {products}=ctx.request.body;
            const productEntities=await strapi.entityService.findMany("api::product.product",{
                filters:{
                    key:products.key
                }
            })
            const lineItems=products.map(product=>{

               

                const realPorduct=productEntities[0];
                const image=product.image
                return{
                    price_data:{
                        currency:"inr",
                        product_data:{
                            name:product.title,
                            images:[image]
                        },
                        unit_amount:product.price * 100

                    },
                    quantity:product.quantity
                }
            })
            const session = await stripe.checkout.sessions.create({
                shipping_address_collection:{
                    allowed_countries:["IN"]
                },
                line_items:lineItems,
                mode: 'payment',
                success_url: `${process.env.CLIENT_BASE_URL}/payments/success`,
                cancel_url: `${process.env.CLIENT_BASE_URL}/payments/failed`,
              });


            await strapi.entityService.create('api::order.order',{
                data:{
                    products,
                    stripeId:session.id
                }
            })


            return {stripeId:session.id};
        }catch(error){
            console.log(error);
            ctx.response.status=500;
            return error;
        }

    }
  }));
