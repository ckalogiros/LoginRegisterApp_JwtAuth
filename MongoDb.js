import Mongoose from 'mongoose';
import bcrypt from 'bcryptjs'



const { Schema, model } = Mongoose;


/**
 * MongoDb database structure
 * 1. Database
 * 2. Collections - A databbsae may have many collections
 * 3. Documents - A collection may have many documents
 * 4. Type:BSON - BinaryObjectNotation, a JSON-like key-value pair
 */

// Create a scema. The object schema will reflect the stucture of the document in the database
const userRegistrationScheme = new Schema({
    email: {
        type: String,
    },
    password: {
        type: String,
    },

    date: {
        type: Date,
        default: Date.now
    }
});

export const UserModel = model('User', userRegistrationScheme);

export async function CreateUser(user, callback) {
    try {
        const result = await user.save();
        return result;
    } catch (err) {
        // console.log(err)
        return err;
    }
}

export async function FindUser(query, callback) {
    const found = await UserModel.findOne(query, callback);
    return found;
}
export function DeleteUser(query) {
    UserModel.findOneAndDelete(query, function (err) {
        if (err) console.log(err);
        console.log("Successful deletion");
    });
}
export async function UpdateUser(query, update, callback){
    const user = await UserModel.findOneAndUpdate(query, update, callback);
    console.log('Update User:', user);
    
    try {
        const result = await user.save();
        return result;
    } catch (err) {
        console.log(err)
        return err;
    }
}

/* Create a post-save callback */
userRegistrationScheme.post('save', async function(doc, next){
    // console.log('User was saved in the database. User:', doc)
    // Hash the password before save to the database
    // const salt = await bcrypt.genSalt();
    // this.password = await bcrypt.hash(this.password, salt);
    next();
});
/* Create a pre-save callback */
userRegistrationScheme.pre('save', function(next){ // Must not be an arrow function in order for the 'this' keyword to work
    // The 'this' refers to the 'newUser' that was instantiated in 'AuthControler.js', 
    // also as the 'user' param in 'function CreateUser(user, callback)'
    console.log('Checking user before save to the database', this); 
    next();
});


/**
 * Create custom methods 
 */
userRegistrationScheme.statics.FunctionName = async function(){
    // body here
}

userRegistrationScheme.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      }
      throw Error('incorrect password');
    }
    throw Error('incorrect email');
  };

