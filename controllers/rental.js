const express = require("express");
const router = express.Router();
// const rentals = require("../models/rental-db");
const rentals = require("../models/rentalModel");

router.get("/", (req, res) => {
    res.render("rentals/rentals", {
        rentals: rentals.getRentalsByCityAndProvince(),
    });
});

router.get("/list", async (req, res) => {
    if (req.session && req.session.user && !req.session.isCustomer) {
        const data = await rentals.find().sort({headline: "asc"}).lean();
        res.render("rentals/list", {
            rentals: data
        });
    } else {
        res.status(401).render("general/401");
    }
});

router.get('/add', (req, res) => {
    res.render('rentals/add-rental');
});
  
router.post('/add', async (req, res) => {

    const {headline, numSleeps, numBedrooms, numBathrooms, pricePerNight, city, province, filename, site, picUrl, author, featuredRental} = req.body;

    try {
        const resp = await rentals.create({
        headline: headline,
        numSleeps: numSleeps,
        numBedrooms: numBedrooms,
        numBathrooms: numBathrooms,
        pricePerNight: pricePerNight,
        city: city,
        province: province,
        imageUrl: '/img/houses/' + filename,
        featuredRental: featuredRental === 'on' ? true : false
        });
        if (resp) {
            res.redirect('/rentals/list');
        }
    }  catch (err) {
        console.log(err);
        res.status(500).send('Error adding rental to database!');
    }
});

router.get('/edit/:id', (req, res) => {
    rentals.findById(req.params.id, (err, rental) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error retrieving rental from database!');
      } else {
        res.render('rentals/edit', { rental: rental });
      }
    }).lean();
  });

  router.get('/delete/:id', async (req, res) => {
    try {
      const rental = await rentals.findOneAndRemove(req.params.id).lean();
      if (rental)
        res.redirect('rentals/list');
    } catch (err) {
      console.log(err);
      res.status(500).send('Error retrieving rental from database!');
    }
  });


module.exports = router;