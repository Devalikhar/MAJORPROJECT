const Listing = require("../models/listing.js");
const axios = require("axios");


module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  console.log(allListings);
  res.render("listings/index.ejs", { allListings });

};

module.exports.renderNewForm = (req,res) => {
            res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res) => {
            const {id} = req.params;
            const listing = await Listing.findById(id)
            .populate({
               path: "reviews",
               populate: {
                  path: "author",
               },
            })
            .populate("owner");
            if(!listing){
               req.flash("error","Listing you requested for does not exist!");
                return res.redirect("/listings");
            }

            console.log(listing);
            res.render("listings/show.ejs",{listing});
            console.log("Listing ID:", listing._id);
            console.log("Owner:", listing.owner);
         }

module.exports.createListing = async(req,res,next) => {
   const response = await axios.get(
   "https://nominatim.openstreetmap.org/search",
   {
     params: {
       q: req.body.listing.location,
       format: "json",
       limit: 1,
     },
     headers: {
       "User-Agent": "wanderlust-app",
     },
   }
 );
 
 if (response.data.length === 0) {
   req.flash("error", "Location not found");
   return res.redirect("/listings/new");
 }
 
 const place = response.data[0];
 
 let newListing = new Listing(req.body.listing);

 newListing.geometry = {
   type: "Point",
   coordinates: [
     parseFloat(place.lon),
     parseFloat(place.lat),
   ],
 };
           
               
     // Fix image
           if (
            !req.body.listing.image ||
            !req.body.listing.image.url ||
            req.body.listing.image.url.trim() === ""
          ) {
            req.body.listing.image = {
              url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60",
              filename: "listing_image",
            };
          }
         
          if (req.file) {
            let url = req.file.path;
            let filename = req.file.filename;
            newListing.image = { url, filename };
        } 

           newListing.owner = req.user._id;

         

           let savedListing = await newListing.save();
           console.log(savedListing);
           req.flash("success","New Listing Created");
           res.redirect("/listings");
         }

         
module.exports.renderEditForm = async(req,res) => {
            let { id } = req.params;
            const listing = await Listing.findById(id).populate("owner");
            if(!listing){
               req.flash("error","Listing you requested for does not exist!");
               return res.redirect("/listings");
            }

            let originalImageUrl = listing.image.url;
            originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
            res.render("listings/edit.ejs",{listing,originalImageUrl});
         
         }

module.exports.updateListing = async(req,res) => {
            
            let { id } = req.params;
            let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
            
            if(typeof req.file != "undefined"){
               let url = req.file.path;
               let filename = req.file.filename;
               listing.image = {url,filename};
               await listing.save();
            }
            req.flash("success","Listing Updated!");
            res.redirect(`/listings/${id}`);
           
         }
         
 module.exports.destroyListing = async(req,res) => {
            let { id } = req.params;
            let deletedListing = await Listing.findByIdAndDelete(id);
            console.log(deletedListing);
            req.flash("success","Listing Deleted");
            res.redirect("/listings");
         }   
         
         
        