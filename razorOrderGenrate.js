const app = require('express')();
const Razorpay = require('razorpay');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

app.use(cors());
app.use(bodyParser.json())

require('dotenv').config()

const PORT = process.env.PORT;
const HOST = process.env.HOST || 'localhost';
const KEYID = process.env.KEYID;
const KEYSECRET = process.env.KEYSECRET;

const razorpay = new Razorpay({
	key_id: KEYID,
	key_secret: KEYSECRET
})

app.post('/verification', (req, res) => {
	// req.body = {"order_id": razorpayOrderId, "payment_id": razorpayPaymentId }
	// header : req.headers['x-razorpay-signature']
	// console.log(req.body);
	// console.log(req.body.payload);

	const secret = process.env.WEBHOOK_SECRET;

	const shasum = crypto.createHmac('sha256', secret);
	shasum.update(JSON.stringify(req.body));
	const digest = shasum.digest('hex');

	// console.log(digest, req.headers['x-razorpay-signature'])

	if (digest === req.headers['x-razorpay-signature']) {
		res.json({ status: true })
		console.log('verified');
		// process whatever zyou like
	} else {
		res.json({ status: false })
		console.log("not verified")
	}
})


app.post('/createorder', async (req, res) => {
	if(!req.body.amount){
		return res.status(503).json({status:false , error:"Enter the Amount"});

	}
	const payment_capture = 1;
	const amount = req.body.amount;
	const currency = req.body.currency || 'INR';

	const options = {
		amount: amount * 100,
		currency,
		receipt: uuidv4(),
		payment_capture
	}

	try {
		const response = await razorpay.orders.create(options);
		res.json({
			status:true,
			id: response.id,
			currency: response.currency,
			amount: response.amount
		})
	} catch (error) {
		return res.status(503).json({status:false , error:error.message});
	}
})

app.listen(PORT, () => {
	console.log(`Server is running on http://${HOST}:${PORT}`);
})