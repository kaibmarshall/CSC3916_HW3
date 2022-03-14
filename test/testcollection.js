let envPath = __dirname + "/../.env"
require('dotenv').config({path:envPath});
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let User = require('../Users');
chai.should();

chai.use(chaiHttp);

let login_details = {
    name: 'Test',
    username: 'testUser',
    password: 'test'
}

let movie_request = {
    title: 'movie',
    year: '1900',
    genre: 'Action',
    actor1: {
        actorName: "Bo Burnham",
        characterName: "Zac Stone"
    },
    actor2: {
        actorName: "Johnny Depp",
        characterName: "Jack Sparrow"
    },
    actor3: {
        actorName: "Zendaya",
        characterName: "MJ"
    }
}

describe('Login and Call Test Collection with Basic Auth and JWT Auth', () => {
   beforeEach((done) => { //Before each test initialize the database to empty
       //db.userList = [];

       done();
    })

    after((done) => { //after this test suite empty the database
        //db.userList = [];
        User.deleteOne({ name: 'test'}, function(err, user) {
            if (err) throw err;
        });
        done();
    })

    //Test the GET route
    describe('/signin', () => {
        it('it should login successfully', (done) => {
                chai.request(server)
                    .post('/signin')
                    .send(login_details)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('token');
                        let token = res.body.token;
                        console.log(token);
                        done();
                    })
              })
        })
    });

    // describe('/movies', () => {
    //     it('Should make a movie', (done) => {
    //         chai.request(server)
    //             .post('/movies')
    //             .send(movie_request)
    //             .end((err, res) =>{
    //                 console.log(JSON.stringify(res.body));
    //                 res.should.have.status(200);
    //                 res.body.success.should.be.eql(true);
    //                 done();
    //             })
    //     })
    // });

    // describe('/movies', () => {
    //     it('Should get all movies', (done) => {
    //         chai.request(server)
    //             .get('/movies')
    //             .send(movie_request)
    //             .end((err, res) => {
    //                 console.log(JSON.stringify(res.body));
    //                 res.should.have.status(200);
    //                 done();
    //             })
    //     })
    // });

    describe('/movies/:movie', () => {
        it('Should find the movie called movie', (done) => {
            chai.request(server)
                .get('/movies/:movie')
                .end((err, res) => {
                    console.log(JSON.stringify(res.body));
                    res.should.have.status(200);
                    done();
                })
        })
    });




