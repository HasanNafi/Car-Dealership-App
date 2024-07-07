// Final Team Project
// Submission By: 
// Dhariya Vinod Vayas: C0840249
// Hemani Patel: C0853622
// Anik Hasan: C0847377
// Md Kamrul Islam Antar: C0826256
// Ishank Agarwal: C0850072



let express = require('express');
let router = express.Router();
let fs = require('fs');
let path = require('path');
let dbPath = "./carsDB.json";
let carData = [];

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname)
    }
})
const upload = multer({
    storage: storage
}).array('images', 4);

// Create a new car
router.post('/cars', (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log("Multer error occurred.");
            console.log(err);
            if (err.code == "LIMIT_UNEXPECTED_FILE") {
                return res.status(500).send("Please upload upto 4 images");
            } else {
                return res.status(500).send('Error uplaoding files');
            }
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log("An unknown error occurred when uploading.");
            console.log(err);
            return res.status(500).send('Error writing to database');
        }
        let carData = JSON.parse(fs.readFileSync(dbPath));

        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(o => o.filename);
        }
        const newCar = req.body;
        newCar["images"] = images;
        let carExists = true;
        if (newCar.id) {
            carExists = carData.cars.find((car) => car.id === newCar.id);
        } else {
            return res.status(400).send('Invalid car id');
        }

        if (carExists) {
            return res.status(400).send('Car already exist');
        }

        carData.cars.push(newCar);

        fs.writeFile(dbPath, JSON.stringify(carData), (err) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error writing to database');
            }

            return res.status(201).send('Car added successfully');
        });
    })
});

function sort(obj, field, highToLow = false) {
    return new Promise((resolve, reject) => {
        try {
            obj.sort(function (a, b) {
                if (highToLow) {
                    return b[field] - a[field];
                } else {
                    return a[field] - b[field];
                }
            });
            resolve(obj);
        } catch (error) {
            reject(obj);
        }
    });
}

// Get all cars
router.get('/cars', async (req, res) => {
    let carData = JSON.parse(fs.readFileSync(dbPath));
    if (req.query.sort) {
        switch (req.query.sort) {
            case "1":
                carData.cars = await sort(carData.cars, "price", false);
                break;
            case "2":
                carData.cars = await sort(carData.cars, "price", true);
                break;
            case "3":
                carData.cars = await sort(carData.cars, "kms", false);
                break;
            case "4":
                carData.cars = await sort(carData.cars, "kms", true);
                break;
            
            default:
                break;
        }
    }
    return res.status(200).json(carData.cars);
});

// Get a car by ID
router.get('/cars/:id', (req, res) => {
    let carData = JSON.parse(fs.readFileSync(dbPath));
    const car = carData.cars.find((car) => car.id == req.params.id);
    if (!car) {
        return res.status(404).send('Car not found');
    }
    return res.status(200).json(car);
});

// Update a car by ID
router.put('/cars/:id', (req, res) => {
    let carData = JSON.parse(fs.readFileSync(dbPath));
    const updatedCar = req.body;
    const carIndex = carData.cars.findIndex((car) => car.id == req.params.id);
    if (carIndex === -1) {
        return res.status(404).send('Car not found');
    }
    carData.cars[carIndex] = updatedCar;
    fs.writeFile(dbPath, JSON.stringify(carData), (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error writing to database');
        }

        return res.status(200).send('Car updated successfully');
    });
});

// Delete a car by ID
router.delete('/cars/:id', (req, res) => {
    let carData = JSON.parse(fs.readFileSync(dbPath));
    if (!carData || !carData.cars || !carData.cars.length) {
        return res.status(404).send('No cars available to delete');
    }
    const carIndex = carData.cars.findIndex((car) => car.id == req.params.id);

    if (carIndex === -1) {
        return res.status(404).send('Car not found');
    }

    carData.cars.splice(carIndex, 1);

    fs.writeFile(dbPath, JSON.stringify(carData), (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error writing to database');
        }

        return res.status(200).send('Car deleted successfully');
    });
});

module.exports = router;
