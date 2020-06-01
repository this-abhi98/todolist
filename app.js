//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ =require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-abhishek:abhi@dtu20@cluster0-3plqw.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const itemschema = {
  name: String
};
const Item = mongoose.model("Item", itemschema);

const listschema = {
  name:String,
  items:[itemschema]
}

const List = mongoose.model("List",listschema);

const Item1 = new Item({                        //created new document in items(Item in singuler) collection
  name: "Welcome in the to do list"
});
const Item2 = new Item({
  name: "Now,you can start creating list."
});
const defaultItems = [Item1, Item2];      //defaultItems contain two docs of item 1 and item 2 of Item collection nut remember that itd still not saved in the item collection.we will handle this later
/**/
app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {          //it will find all docs in Item(items) collection and bind to founditems bcz there is no const
    if (foundItems.length === 0) {                   //condition in find.callback is neecessary mongoose docs for more
      Item.insertMany(defaultItems, function(err) {  //if only length of the foundItem(means no docs in item colle) then insertMany will insert default Items in the Item database

        if (err) console.log("err");                  //note docs in defaultItems were created before but we didnot in the database so now we will insert in database only if condition satisfy
        else console.log("succesfully inserted default items");
        res.redirect("/");
      })
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName},function(err, foundList){
     if(!err){
       if(!foundList){
         const list = new List({
           name:customListName,
           items:defaultItems
         });
       list.save();
       res.redirect("/" + customListName);
     }
     else
     {
       res.render("list",{listTitle:foundList.name, newListItems: foundList.items})
     }
   }
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item ({
    name : itemName
  });
if(listName === "Today"){
  item.save();                  //it will direct;y same item in its collection called Item
  res.redirect("/");
}
else{
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  })
}


});

app.post("/delete",function(req,res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName

  if(listName==="Today"){
    Item.deleteOne({_id:checkedItemId},function(err){
      if(err) console.log(err);
      else console.log("successfully deleted");
    })
    res.redirect("/");
  }
  else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }
});

app.get("/about", function(req, res) {
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started successfully");
});
