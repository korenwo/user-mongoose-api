const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const User= mongoose.model('user', {
	username: {
		type: String,
		required:true,
		minLength: 3,
		maxLength: 18,
		unique: true
	},
	password: {
		type: String,
		required:true,
		minLength: 8,
		maxLength: 16
	},
	gender: {
		type: String,
		required:true,
		validate: {
			validator: function(v) {
			    return v === 'male' || v === 'female'
			},
			message: () => 'only male or female'
		}
	},
	age: {
		type: Number,
		required:true,
		min: 18
	},
	email: {
		type: String,
		required:true
	},
	createdAt: {
		type:Date,
		default:()=> new Date()
	}
});

app.put('/user', (req, res) => {
	const user = new User(req.body);
	user.save()
		.then((newUser)=> {
			res.sendStatus(201).send(newUser);
		})
		.catch((err) => {
			console.log(err);
			res.status(400).send(err);
		});
});

app.get('/user', (req, res)=> {
	User.find()
		.then(users => res.send(users))
		.catch(()=> res.sendStatus(500));
});

app.get('/user/:id', (req, res)=>{
	User.findById(req.params.id)
	.then(post=> res.json(post))
	.catch(()=> res.sendStatus(500));
});

app.delete('./user/:id', (req, res) => {
	User.findByIdDelete(req.params.id)
		.then(deletedUser=> {
			if(!deletedUser) {
				res.sendStatus(404);
				return;
			}
			res.sendStatus(204);
		})
		.catch(()=> res.sendStatus(500));
});

app.post('/user/:id', (req, res)=> {
	User.findByIdAndUpdate(req.params.id, req.body)
		.then(updatedUser => {
			if(!updatedUser) {
				res.sendStatus(404);
				return;
			}
			res.sendStatus(200);
		})
		.catch((err) => {
			res.status(400).send(err)
		});
});


function listen () {
	app.listen(port, () => console.log(`Server listening on port ${port}!`));
}

function connect(){
	mongoose.connect('mongodb://localhost/pinterest', {
		useNewUrlParser: true,
		 useUnifiedTopology: true
	});
	const db = mongoose.connection;
		db.on('error', console.error.bind(console, 'connection error:'));
		db.once('open', () => {
		listen();
			// we're connected!
	});
}

connect();