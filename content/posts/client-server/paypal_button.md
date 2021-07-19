---
title: 'Paypal payment React-Flask'
date: 2021-07-19T00:00:00+00:00
menu:
  sidebar:
    name: 'Paypal payment React-Flask'
    identifier: client-server-paypal_button
    parent: client-server
    weight: 14
---

# Paypal payment React-Flask
I wrote this guide because there is no code example to implemnt a secure transaction with paypal buttons method with products on own database.

## versions
year: 2021

React:

- node: 14
- "react": "^17.0.2"
- "@paypal/react-paypal-js": "^7.1.2"
- "@reduxjs/toolkit": "^1.6.0"

Flask:

- python 3.8.5
- flask 2.0.1

## Payment Flow

 1. User in the React site add items to cart
 2. User navigate to cart page
 3. User click on "Pay with card"
 4. On user input React call the back-end passing cart and user data
 5. Flask validate cart items throught database (pricing and availability). then respond to React with the validated data
 6. React ask Paypal to create the checkout session with validated data
 7. Open Paypal payment page
 8. User perform payment using Paypal account
 9. Paypal send response to React
 10. If payment success React empty cart and notify User
 11. Paypal notify Flask throught IPN about payment completed with basical order info
 12. Flask update database and React about buyed items

{{<img src="/images/client-server/paypal_flow.png" align="center">}}

## React (front-end)
in the following example it's implemented the paypal button payment method using `react-paypal-js` package and [redux RTKQ](https://redux-toolkit.js.org/rtk-query/overview)

### index.tsx
At the root of project I added the Paypal payment button provider configured with the `client-id` of the app created on Paypal account

```
<PayPalScriptProvider
options={{
'client-id': 'my client id',
currency:  'EUR',
}}>
<App  />
</PayPalScriptProvider>
```

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
4.On user input React call the back-end passing cart and user data `await  paypalCheckout(requestData).unwrap();`

7.React open paypal payment window: `return  actions.order.create(response);`

10.handle empty cart onApprove callback of Paypal button: `onApprove={handlePaypalCheckoutComplete}`

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
	[...] // empty cart and notify success
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
## Flask (back-end)
the back-end needs 2 endpoint

no other configuration needed

### create_checkout_session
Paypal has only 2 categories:

 - **PHYSICAL_GOODS** A tangible item that can be shipped with proof of delivery.
 - **DIGITAL_GOODS** Goods that are stored, delivered, and used in their electronic format.

this endpoist is POST and have to:

 - validate user data using database
 - check for item availability
 - send to client the data for paypal button (create order function)

create_checkout_session function:
```
json_data = request.get_json(force=True)
[fbs, quantities] = parse_checkout_request(json_data)
items = []
total = 0
for  i, fb  in  enumerate(fbs):
	euro = str(fb.price)
	euro = euro[:-2] + "." + euro[-2:]
	items.append(
	{
		"name": fb.name,
		"sku": fb.id,
		"unit_amount": {
			"currency_code": "EUR",
			"value": euro,
		},
		"quantity": str(quantities[i]),
		"category": "DIGITAL_GOODS",
	}
)
total += fb.price * quantities[i]
total = str(total)
total = total[:-2] + "." + total[-2:]
res = {
	"purchase_units": [
	{
		"custom_id": get_jwt_identity(),
		"amount": {
			"currency_code": "EUR",
			"value": total,
			"breakdown": {
			"item_total": {
				"currency_code": "EUR",
				"value": total,
				},
			},
		},
		"items": items,
	}],
}
return  res
```
### paypal_ipn_listener
This endpoint will be called from paypal until he gets the response

For sandbox ipn this is the string in the config.json: `"PAYPAL_IPN_VALIDATE_URL":"https://ipnpb.sandbox.paypal.com/cgi-bin/webscr"`

Meanwhile the live url is: `https://ipnpb.paypal.com/cgi-bin/webscr`

The right method to get data from request is: `request.form.to_dict()`

The header of the validation ipn should be set with: `"User-Agent": "Flask-IPN-Verification-Script"`

This endpoist is POST and have to:

 - verify that it is called from paypal ipn (it will respond with `VERIFIED` if it is trusted)
 - verify that it isn't a dupplicate call or be idempotent
 - respond to paypal with status 200 as early as possible
 - fulfill order updating database and client

paypal_ipn_listener function:
```
payload = request.form.to_dict()
validate_data = ""
for  key, value  in  payload.items():
	validate_data += "&%s=%s" % (str(key), str(value))
validate_url = "%s?cmd=_notify-validate%s" % (
API.config["PAYPAL_IPN_VALIDATE_URL"], validate_data)
h = {"User-Agent": "Flask-IPN-Verification-Script", "Connection": "Close"}
r = requests.post(validate_url, headers=h)
if  r.text != "VERIFIED":
	raise  APIException("IPN non valida")
# TODO check the txn_id against the previous PayPal transaction that you processed to ensure the IPN message is not a duplicate
if  payload["payment_status"] != "Completed":
	raise  APIException(payload["payment_status"])
user_id = payload["custom"]
ids = []
for  i  in  range(int(payload["num_cart_items"])):
	index = str(i + 1)
	release_footballer_id = payload["item_number" + index]
	release_footballer_quantity = payload["quantity" + index]
	ids.append(release_footballer_id)
# TODO update database and client
return {}
```
## Paypal config

 1. create Paypal account
 2. create Paypal sandbox application and get client-id
 3. create Paypal sandbox merchant account, set password and login
 4. create Paypal sandbox buyer account, set password and login
 5. check that the sandbox account are binded to the sandbox application which you are using
 6. create ipn service (under notification) and set the URL to your server paypal_ipn_listener endpoint
