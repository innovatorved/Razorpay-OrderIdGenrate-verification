const app = require('express')();
const Razorpay = require('razorpay');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';
const KEYID = process.env.KEYID;
const KEYSECRET = process.env.KEYSECRET;

const razorpay = new Razorpay({
	key_id: KEYID,
	key_secret: KEYSECRET
})


app.post('/createorder', async (req, res) => {
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
		// console.log(response);
		res.json({
			id: response.id,
			currency: response.currency,
			amount: response.amount
		})
	} catch (error) {
		console.log(error)
	}
})

app.listen(PORT, () => {
	console.log(`Server is running on http://${HOST}:${PORT}`);
})