const { mongoose } = require('mongoose');
const Mongourl = 'mongodb://mongo:27017/';
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

const reviewSchema = new mongoose.Schema({
    title: String,
    author: String,
    date: Date,
    content: String,
    image: String
})


const reviewModel = mongoose.model('review', reviewSchema);
const userModel = mongoose.model("user", userSchema);

const checkDatabaseConnection = () => {
	if(mongoose.connection.readyState === 1) return true; 
	return false;
}
const firstTime = async () => {
    addUser('admin','password','admin');
    addReview('test','Donald Trump', 'twitter', 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.gannett-cdn.com%2F-mm-%2F70373520bf27bf63db12a20c298f8120e76f2b19%2Fc%3D0-0-5165-2918%26r%3Dx1683%26c%3D3200x1680%2Flocal%2F-%2Fmedia%2F2017%2F05%2F31%2FUSATODAY%2FUSATODAY%2F636318126740275435-AP-Trump-US-G7.jpg&f=1&nofb=1&ipt=7bcb18880ef19ce9790e161519d8a8d33bb95ba4c6f2506d2293fdaa3cf2d0ae&ipo=images');
}
const addReview = async (title = 'no title', author = 'no author', description='no text', image='') =>{

    // todo check database en check user ingelogd.......
    const date = new Date();
  
    try {
      const newReview = new reviewModel({
        title,
        author,
        date,
        description,
        image,
      });
  
      await newReview.save();
    } catch (error) {
      console.error(error);
    }
  };
const getReviewById = async(id=0) =>{
    try {
        const review = await reviewModel.findById(id);
        if(!review) return;
        return review
    } catch (err) {
        console.log(err)
        // tf server error
        return null;
    }
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
const getAllReviews = async () => {
    if(!checkDatabaseConnection()) return;
    const reviews = await reviewModel.find();
    return reviews;
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

const deleteUser = async (givenUsername) => {
    if(!checkDatabaseConnection()) return;
    await userModel.deleteOne({ username: givenUsername });
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

	
		
	
module.exports = {firstTime, getReviewById, addReview, authenticateUser, addUser, deleteUser,  getAllUsers, getAllReviews, getUserType};
