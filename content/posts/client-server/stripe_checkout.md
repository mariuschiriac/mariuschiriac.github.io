---
title: 'Stripe payment React-Flask'
date: 2021-07-16T00:00:00+00:00
menu:
  sidebar:
    name: 'Stripe payment React-Flask'
    identifier: client-server-stripe_checkout
    parent: client-server
    weight: 13
---


# Stripe payment React-Flask
## Payment Flow

 1. User in the React site add items to cart
 2. User navigate to cart page
 3. User click on "Pay with card"
 4. On user input React call the back-end passing cart and user data
 5. Flask validate cart items throught database (pricing and availability)
 6. Flask ask Stripe to create a checkout session, then send back session url to React
 7. React redirect User to stripe checkout page
 8. User perform payment using card
 9. Stripe redirect User to success/failed url (the cart React page)
 10. If payment success React empty cart and notify User
 11. Stripe notify Flask throught webhook about payment completed with basical order info
 12. Flask update database and React about buyed items

{{<img src="/images/client-server/stripe_flow.png" align="center">}}

## React (front-end)
React functional with typescript.
In the following example it's implemented the front-end side of stripe checkout payment using [redux RTKQ](https://redux-toolkit.js.org/rtk-query/overview)

### models/Payment.ts
	import { CartFootballer } from  './Footballer'; 
	export  interface  CheckoutResponse {
	checkout_url: string;
	}
	export  interface  CheckoutRequest {
	cartFootballers: CartFootballer[];
	email: string;
	}

### api.ts
	import { createApi, fetchBaseQuery } from  '@reduxjs/toolkit/query/react';
	import  Cookies  from  'js-cookie';
	import { CheckoutRequest, CheckoutResponse } from  'models/Payment';
	export  const  api = createApi({
	baseQuery:  fetchBaseQuery({
	baseUrl:  process.env.REACT_APP_API_URL,
	credentials:  'include',
	prepareHeaders: (headers, { getState }) => {
	const  token = Cookies.get('csrf_access_token');
	// If we have a token set in state, let's assume that we should be passing it.
	if (token) headers.set('x-csrf-token', token);
	return  headers;
	},
	}),
	endpoints: (builder) => ({
	stripeCheckout:  builder.mutation<CheckoutResponse, CheckoutRequest>({
	query: (credentials) => ({
	url:  'payment/createCheckoutSession',
	method:  'POST',
	body:  credentials,
	}),
	}),
	paypalCheckout:  builder.mutation<any, CheckoutRequest>({
	query: (credentials) => ({
	url:  'payment/paypal/createCheckoutSession',
	method:  'POST',
	body:  credentials,
	}),
	}),
	}),
	});
	export  const { useStripeCheckoutMutation, usePaypalCheckoutMutation } = api;
### cart.tsx
 - On user input React call the back-end passing cart and user data `const  response = await  stripeCheckout(data).unwrap();`
 - React redirect User to stripe checkout page `window.location.replace(response.checkout_url);`
 - If payment success React empty cart and notify User  `useEffect(() => {[...]}`

```
import  React, { FC, useEffect } from  'react';
import  Item  from  './Item';
import { useCart } from  'services/cart';
import {useStripeCheckoutMutation,usePaypalCheckoutMutation} from  'redux/api';
import { CheckoutRequest } from  'models/Payment';
import { FUNDING, PayPalButtons } from  '@paypal/react-paypal-js';
const  App: FC = () => {
const { cart } = useCart();
const [stripeCheckout, { isLoading: stripeIsLoading }] =
useStripeCheckoutMutation();
const [paypalCheckout, { isLoading: paypalIsLoading }] =
usePaypalCheckoutMutation();
const  handleCheckout = async () => {
const  data: CheckoutRequest = {
cartFootballers:  cart,
email:  user?.email || '',
};
try {
const  response = await  stripeCheckout(data).unwrap();
window.location.replace(response.checkout_url);
} catch (error) {
console.log(error.response);
}
};
const  handlePaypalCheckoutComplete = async (data: any, actions: any) => {
try {
const  response = await  actions.order.capture();
console.log(response);
} catch (error) {
console.log(error.response);
}
};
const  handlePaypalCreateOrder = async (data: any, actions: any) => {
const  requestData: CheckoutRequest = {
cartFootballers:  cart,
email:  user?.email || '',
};
try {
const  response = await  paypalCheckout(requestData).unwrap();
console.log(response);
return  actions.order.create(response);
} catch (error) {
console.log(error.response);
}
return  '';
};
useEffect(() => {
// Check to see if this is a redirect back from Checkout
const  query = new  URLSearchParams(window.location.search);
if (query.get('success')) {
console.log('Order placed! You will receive an email confirmation.');
// empty cart and redirect to /cart
}
if (query.get('canceled'))
console.log('Order canceled -- continue to shop around');
}, [cart]);
return (
<>
{cart.length === 0 ? (
<p>empty cart</p>
) : (
<>
<div>
{cart.map((cartFootballer, key) => (
<Item
cartFootballer={cartFootballer.footballer}
quantity={cartFootballer.quantity}
key={key}
/>
))}
</div>
<div>
<button  onClick={handleCheckout}>Pay with card</button>
<PayPalButtons
createOrder={handlePaypalCreateOrder}
onApprove={handlePaypalCheckoutComplete}
fundingSource={FUNDING.PAYPAL}
style={{ height:  50, shape:  'pill' }}
></PayPalButtons>
</div>
</>
)}
</>
);
};
export  default  App;
```
## Flask (back-end)
the back-end needs 2 endpoint

- install stripe `pip install stripe`
- configure stripe

```
import  stripe
stripe.api_key = API.config["STRIPE_SK"]
```

### create_checkout_session
this endpoist is POST and have to:

 - validate user data using database
 - check for item availability
 - create stripe checkout session
 - send to client the checkout page url

create_checkout_session function:

	json_data = request.get_json(force=True)
	[fbs, quantities] = parse_checkout_request(json_data)
	email = json_data["email"]
	items = []
	info_items = {"items_number": len(fbs)}
	for  i, fb  in  enumerate(fbs):
		items.append({
			"price_data":{
				"currency": "eur",
				"unit_amount": fb.price,
				"product_data": {
					"name": fb.name,
				},
			},
			"quantity": quantities[i],
		})
		info_items["id" + str(i)] = fb.id
		info_items["quantity" + str(i)] = quantities[i]
	try:
		checkout_session = stripe.checkout.Session.create(
		customer_email=email,
		payment_method_types=["card"],
		line_items=items,
		mode="payment",
		success_url=API.config["BASE_URL_FRONT"] + "/cart?success=true",
		cancel_url=API.config["BASE_URL_FRONT"] + "/cart?canceled=true",
		metadata=info_items,
		)
	except:
		raise  APIException("pagamento fallito")
	return {"checkout_url": checkout_session.url}
### stripe_checkout_webhook
This endpoint will be called from stripe until he gets the response
It's very important to retrieve the stripe data with `request.data.decode("utf-8")`
This endpoist is POST and have to:

 - verify that it is called from stripe webhook
 - verify that it isn't a dupplicate call or be idempotent
 - respond to stripe with status 200 as early as possible, the best is to respond just after the verification and launch another process to complete the task
 - fulfill order updating database and client

stripe_checkout_webhook function:

	payload = request.data.decode("utf-8")
	sig_header = request.headers["STRIPE_SIGNATURE"]
	event = None
	try:
		event = stripe.Webhook.construct_event(
		payload, sig_header, API.config["STRIPE_WEBHOOK_KEY"]
		)
	except  ValueError  as  e:
		raise  APIException("Invalid payload")
	except  stripe.error.SignatureVerificationError as  e:
		raise  APIException("Invalid signature")
	if  event  is  None  or  event["type"] != "checkout.session.completed":
		raise  APIException("evento non consistente")
	# check if event is not dupplicate
	[...]
	session = event["data"]["object"]
	email = session["customer_email"]
	items = session["metadata"]
	# update db and client
	[...]
	return {}

## Stripe config

 1. create Stripe account
 2. get secret key
 3. create webhook
 4. get webhook key
