module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // // show the home page (will also have our login links)
    // app.get('/', function(req, res) {
    //     res.render('login.ejs');
    // });
    // HOME PAGE =========================
    app.get('/home', isLoggedIn, function(req, res) {
        db.collection('postings').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('index.ejs', { user : req.user, postings: result })
          console.log(result)
        })
    });
    // HOST SECTION =========================
    app.get('/host', isLoggedIn, function(req, res) {
        db.collection('postings').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('host.ejs', { user : req.user, postings: result })
          console.log(result)
        })
    });
    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('postings').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', { user : req.user, postings: result })
          console.log(result)
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// posting section routes ===============================================================

    app.post('/api/posting', isLoggedIn, (req, res) => {
      let uid = req.user._id;
      db.collection('postings').save({name: req.body.name, location: req.body.location, status: req.body.status, uid: uid}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

    app.put('/api/status', (req, res) => {
      // if(req.user){
        db.collection('postings')
        .findOneAndUpdate({name: req.body.name, location: req.body.location}, {
          $set: {
            status: req.body.status
          }
        }, {
          sort: {_id: -1},
          upsert: true
        }, (err, result) => {
          if (err) return res.send(err)
          res.send(result)
        })
      // }
    })



    app.delete('/api/delete', isLoggedIn, (req, res) => {
      console.log('delete')
      db.collection('postings').findOneAndDelete({name: req.body.name, location: req.body.location, status: req.body.status}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Posting deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/', function(req, res) {
          //two arguments passing through the render method: the ejs file and the data that will pass through ejs template
            res.render('login.ejs', { posting: req.flash('loginMessage') });

        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/home', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));


    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
