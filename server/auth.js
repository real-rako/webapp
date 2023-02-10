const { mongoose } = require('mongoose');
const Mongourl = 'mongodb://127.0.0.1:27017/';
const bcrypt = require('bcryptjs');
const { Admin } = require('mongodb');

mongoose.set('strictQuery', false);
mongoose.connect(Mongourl).then(() => {
    console.log("Connected succesfully to database.");
}).catch((err)=>{
    console.log("Error received: " + err);
});

const userSchema = new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true,unique:true},
    joined: { type: Date, default: Date.now },
    userType: { type: String, default: 'user' }

});



const userModel = mongoose.model("user", userSchema);

const checkDatabaseConnection = () => {
	if(mongoose.connection.readyState === 1) return true; 
	return false;
}

const getUser = async (username = {}) => {
	if(!checkDatabaseConnection()) return; 
	const user = await userModel.findOne({username});
	if(!user) return;
	else return user; 
}

const getAllUsers = async () => {
    if(!checkDatabaseConnection()) return;
    const users = await userModel.aggregate([{ $project: { _id : 0, username : 1} }]);
    return users;     
}

const checkExistenceUser = async (username={}) =>{
    user = await getUser(username);
    if(user) return true;
    else return false;

}

const addUser = async (username = {}, password = {}, userType = 'user') => {
    if(!checkDatabaseConnection()) { console.log(1); return;}
    if( await checkExistenceUser(username)) { console.log(2); return;}
    const user = new userModel(); 
    user.username = username;
    user.password = bcrypt.hashSync(password, 10);
    user.userType = userType;
    await user.save();
}

const authenticateUser = async (username = {} , password = {}) =>{
	const user = await getUser(username); 
	if(!user) return false
	else {
		if(await bcrypt.compare(password, user.password)) {
            return true;
		}
	};
}
const getUserType = async (username = {}) => {
	const user = await getUser(username);
	if(!user) return;
	return user.userType;
}

	
		
	
module.exports = {authenticateUser, addUser, getUserType};
