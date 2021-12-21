var bcrypt = require('bcryptjs');
var db = require('../config/connection');
var collections = require('../config/collections');
var objectId=require('mongodb').ObjectId

module.exports = {
   doSignup:function(institutionData) {
      return new Promise(async(resolve, reject) => {
         delete institutionData.cpassword
         institutionData.date = new Date()
         response = {}
         let institution = await db.get().collection(collections.INSTITUTION_COLLECTION).findOne({$or:[{email:institutionData.email}, {mobile:institutionData.mobile}, {id:institutionData.id}]})
         if(institution)
         {
            response.signupErr = "Account already exists. Please login"
            response.status = false
            resolve(response)
         }
         else
         {
            institutionData.password = await bcrypt.hash(institutionData.password, 10)
            db.get().collection(collections.INSTITUTION_COLLECTION).insertOne(institutionData).then((data) => {
               response.institution = data.ops[0]
               response.status = true
               resolve(response)
            })
         }
      })
   },
   doLogin:function(institutionData) {
      return new Promise(async(resolve, reject) => {
         response = {}
         let institution = await db.get().collection(collections.INSTITUTION_COLLECTION).findOne({email:institutionData.email})
         if(institution)
         {
            bcrypt.compare(institutionData.password, institution.password).then((status) => {
               if(status)
               {
                  response.institution = institution
                  response.status = true
                  resolve(response)
               }
               else
               {
                  response.loginErr = "Invalid Email or Password"
                  response.status = false
                  resolve(response)
               }
            })
         }
         else
         {
            response.loginErr = "Invalid Email or Password"
            response.status = false
            resolve(response)
         }
      })
   },
   generateInstitutionId:function() {
      return new Promise(async(resolve, reject) => {
         function generateId(length)
         {
            let id = '';
            let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            for (i = 0; i < length; i++)
            {
               id += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return id;
         }
         do
         {
            var institutionId = await generateId(8)
            var institution = await db.get().collection(collections.INSTITUTION_COLLECTION).findOne({id:institutionId})
         }while(institution)
         resolve(institutionId)
      })
   },
   /*Here we create a new class */
   addClass:function(classData){
      return new Promise((resolve, reject) => {
      db.get().collection(collections.CLASS_COLLECTION).insertOne(classData).then((data)=>{
        
         resolve()
     })
     
   })
   },
   /*Here we store data of every class we created as an array*/
   getAllClass:function(){
      return new Promise((resolve,reject)=>{
         let classes=db.get().collection(collections.CLASS_COLLECTION).find().toArray()
         resolve(classes)
      })
   },
   addAnnouncement:function (announcementData){
      return new Promise(async (resolve, reject) => {
         /*Date format*/
         let  date= new Date()
         console.log(date.toLocaleString('en-US', {
         weekday: 'short', // "Sat"
         month: 'long', // "June"
         day: '2-digit', // "01"
         year: 'numeric' // "2019"
         }))
         console.log(date.toDateString())
         console.log(date.toLocaleTimeString())
         announcementData.date = await date.toDateString()+' Time: '+date.toLocaleTimeString()
      db.get().collection(collections.ANNOUNCEMENT_COLLECTION).insertOne(announcementData).then((data)=>{
        
         resolve()
     })
     
   })
   },
   /*Here we check which type of announcement does it vissible to whom */
   getAnnouncements:function (type,InstitutionId){
      return new Promise(async (resolve, reject) => {
      let announcements=await db.get().collection(collections.ANNOUNCEMENT_COLLECTION).aggregate([
         {
           
           $match:
           {
              $and:[
                 {institutionId:InstitutionId},
                 {visiblity:type},
              ]
           }
         },
         {
           $project:{
            _id :1,title :1,date :1,content :1,visiblity:1
           }
         }
       ]).toArray()
       resolve(announcements)
       console.log(announcements);
      })

   },
   getStudentsIn_institution:(institutionId)=>{
      console.log("hey i am here"+institutionId);
      return new Promise(async(resolve,reject)=>{ 
        let students=await db.get().collection(collections.STUDENT_COLLECTION).aggregate([
          {
            $match:{institution:objectId(institutionId)}
          },
          {
             $sort:{fname:1,lname:1}
          },
         
         {
            $project:{
              fname:1,lname:1,email:1,mobile:1,guardian:1,address:1,gender:1,date:1
 
            }
          }
        ]).toArray()
        console.log(students);
        resolve(students)
      })
    },
    getStudentDetails:(studentId)=>{
      return new Promise(async(resolve,reject)=>{
        let studentDetail=await db.get().collection(collections.STUDENT_COLLECTION).findOne({_id:objectId(studentId)})
        console.log(studentDetail);
        resolve(studentDetail)
      })
    },
    
     /*Here we create a new class */
     addRemarks:function(remarks){
      return new Promise((resolve, reject) => {
      db.get().collection(collections.CLASS_COLLECTION).insertOne(remarks).then((data)=>{
         resolve()
     })
     
   })
   }, 
}