require('dotenv').config()
// FORMURL = https://docs.google.com/forms/d/e/****/formResponse?usp=pp_url your form url
// RECAPTCHAKEY = 6***s from https://www.google.com/recaptcha/admin

const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const axios = require("axios")

var cors = require("cors")

app.use(cors())

app.use(bodyParser.json())

app.get("/", (req, res) => {
	res.json({
		port: PORT,
		info: "Compec DataCamp API http://datacamp.boun.edu.tr/",
		developer: "EminDeniz99"
	})
})

app.get("/datacampkayit", (req, res) => {
	console.log(req.body)
	let r = req.query

	var formLink = process.env.FORMURL
		// "https://docs.google.com/forms/d/e/***Unique-Form-Parameter***/formResponse?usp=pp_url"

	var recaptchaKey = ""
	// console.log(formLink);


	// parse the request and get recaptcha to check, also forward inputs to google forms link
	Object.keys(r).map(item => {
		// console.log(item,r[item])

		if (item == "recaptcha") {
			recaptchaKey = r[item]
		} else {
			formLink += "&" + item + "=" + r[item]
		}
		// console.log(formLink);
	})

	if (
		recaptchaKey == undefined ||
		recaptchaKey == null ||
		recaptchaKey == ""
	) {
		console.log("bos recap")

		return res.json({
			responseCode: "ERROR",
			responseDesc: "Lütfen Captcha'yı doldurunuz."
		})
	} else {
		var secretKey = process.env.RECAPTCHAKEY
		// req.connection.remoteAddress will provide IP address of connected user.
		var verificationUrl =
			"https://www.google.com/recaptcha/api/siteverify?secret=" +
			secretKey +
			"&response=" +
			recaptchaKey +
			"&remoteip=" +
			req.connection.remoteAddress
		// Hitting GET request to the URL, Google will respond with success or error scenario.

		console.log("anahtar", recaptchaKey)

		axios.get(encodeURI(verificationUrl)).then(response => {
			console.log("log rsdata,", response.data)

			if (response.data.success !== undefined && !response.data.success) {
				return res.json({
					responseCode: "ERROR",
					responseDesc: "Lütfen tekrar Captcha'yı doldurunuz"
				})
			} else {
				axios
					.get(encodeURI(formLink))
					.then(response => {
						// console.log(response.data.url);
						// console.log(response.data.explanation);
					})
					.catch(error => {
						console.log(error)
					})

				console.log(formLink)

				return res.json({
					responseCode: "OK",
					responseDesc: "Basarili"
				})
			}

			// console.log(response);
		})
	}

	// "&entry.1140033869="+"ad%C4%B1n"+
	// "&entry.1139239116=soyad%C4%B1n"+
	// "&submit=Submit"
})

const PORT = normalizePort(process.env.PORT || "4000")

function normalizePort(val) {
	var port = parseInt(val, 10)

	if (isNaN(port)) {
		// named pipe
		return val
	}

	if (port >= 0) {
		// port number
		return port
	}

	return false
}

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
