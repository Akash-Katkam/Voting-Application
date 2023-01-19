/* eslint-disable no-undef */
const request = require("supertest");
const cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server;

function extractCSRFToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const loginVoter = async (agent, voterID, password) => {
  let res = await agent.get("/voter/login");
  let csrfToken = extractCSRFToken(res);
  res = await agent.post("/voter/login").send({
    voterID: voterID,
    password: password,
    _csrf: csrfToken,
  });
};

const loginAdmin = async (agent, email, password) => {
  let res = await agent.get("/admin/login");
  let csrfToken = extractCSRFToken(res);
  res = await agent.post("/admin/login").send({
    email: email,
    password: password,
    _csrf: csrfToken,
  });
};

const createAdmin = async (agent, email, password) => {
  let res = await agent.get("/admin/signup");
  const csrfToken = extractCSRFToken(res);
  res = await agent.post("/admin/signup").send({
    _csrf: csrfToken,
    firstname: "Test",
    lastname: "User1",
    username: "user1",
    email: email,
    password: password,
  });
};

describe("Testing Functionalities of Voter", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3001, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    await server.close();
  });

  test("Testing Voter Login Functionality", async () => {
    const agent = request.agent(server);
    await createAdmin(agent, "user1@gmail.com", "password");
    let res = await agent.get("/admin/signout");
    expect(res.statusCode).toEqual(302);
    await loginAdmin(agent, "user1@gmail.com", "password");
    // Create An Eleciton First
    res = await agent.get("/admin/elections");
    expect(res.statusCode).toBe(200);
    let csrfToken = extractCSRFToken(res);
    // console.log(csrfToken);
    res = await agent.post("/admin/election").send({
      _csrf: csrfToken,
      name: "Test Election 4",
      cstring: "test_election_4",
    });
    // console.log(res.text);
    expect(res.statusCode).toEqual(302);

    //  Fetch the latest Election
    res = await agent.get("/admin/elections").set("Accept", "application/json");
    let latestElection = JSON.parse(res.text).elections[
      JSON.parse(res.text).elections.length - 1
    ];

    //  Create a Voter
    res = await agent.get("/admin/elections");
    expect(res.statusCode).toBe(200);
    csrfToken = extractCSRFToken(res);
    addVoterResponse = await agent.post("/admin/election/voters").send({
      _csrf: csrfToken,
      voterID: "test_voter",
      password: "test_voter",
      firstname: "Test Voter",
      lastname: "Test Voter",
      votername: "test_voter",
      EId: latestElection.id,
    });
    expect(addVoterResponse.statusCode).toBe(302);

    res = await agent
      .get(`/admin/election/voters/${latestElection.id}`)
      .set("Accept", "application/json");
    // console.log(JSON.parse(res.text));

    res = await agent.get(`/admin/election/questions/${latestElection.id}`);
    expect(res.statusCode).toBe(200);
    csrfToken = extractCSRFToken(res);

    addQuestionResponse = await agent.post("/admin/election/questions").send({
      _csrf: csrfToken,
      title: "Test Question 2",
      EID: latestElection.id,
      desc: "Test Question 2",
      options: ["Option 1", "Option 2", "Option 3"],
    });
    expect(addQuestionResponse.statusCode).toBe(302);

    res = await agent.get(`/admin/election/questions/${latestElection.id}`);
    expect(res.statusCode).toBe(200);
    csrfToken = extractCSRFToken(res);

    addQuestionResponse = await agent.post("/admin/election/questions").send({
      _csrf: csrfToken,
      title: "Test Question 3",
      EID: latestElection.id,
      desc: "Test Question 3",
      options: ["Option 1", "Option 2", "Option 3"],
    });
    expect(addQuestionResponse.statusCode).toBe(302);

    res = await agent.get(`/admin/election/questions/${latestElection.id}`);
    expect(res.statusCode).toBe(200);
    csrfToken = extractCSRFToken(res);

    res = await agent.put(`/admin/election/launch/${latestElection.id}`).send({
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(200);
    // console.log(JSON.parse(res.text))
    expect(JSON.parse(res.text).success).toBe(true);

    res = await agent.get("/admin/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/admin/elections");
    expect(res.statusCode).toBe(302);

    //  Login the Voter
    await loginVoter(agent, "test_voter", "test_voter");
    res = await agent.get("/voter/election");
    expect(res.statusCode).toBe(200); // Redirected to the home page because election is not live
  });

  test("Testing Voter Logout Functionality", async () => {
    const agent = request.agent(server);
    await createAdmin(agent, "user1@gmail.com", "password");
    let res = await agent.get("/admin/signout");
    expect(res.statusCode).toEqual(302);
    await loginAdmin(agent, "user1@gmail.com", "password");
    // Create An Eleciton First
    res = await agent.get("/admin/elections");
    expect(res.statusCode).toBe(200);
    let csrfToken = extractCSRFToken(res);
    // console.log(csrfToken);
    res = await agent.post("/admin/election").send({
      _csrf: csrfToken,
      name: "Test Election 13",
      cstring: "test_election_13",
    });
    // console.log(res.text);
    expect(res.statusCode).toEqual(302);

    //  Fetch the latest Election
    res = await agent.get("/admin/elections").set("Accept", "application/json");
    let latestElection = JSON.parse(res.text).elections[
      JSON.parse(res.text).elections.length - 1
    ];

    //  Create a Voter
    res = await agent.get("/admin/elections");
    expect(res.statusCode).toBe(200);
    csrfToken = extractCSRFToken(res);
    addVoterResponse = await agent.post("/admin/election/voters").send({
      _csrf: csrfToken,
      voterID: "test_voter",
      password: "test_voter",
      firstname: "Test Voter",
      lastname: "Test Voter",
      votername: "test_voter",
      EId: latestElection.id,
    });
    expect(addVoterResponse.statusCode).toBe(302);

    res = await agent
      .get(`/admin/election/voters/${latestElection.id}`)
      .set("Accept", "application/json");
    // console.log(JSON.parse(res.text));

    res = await agent.get(`/admin/election/questions/${latestElection.id}`);
    expect(res.statusCode).toBe(200);
    csrfToken = extractCSRFToken(res);

    addQuestionResponse = await agent.post("/admin/election/questions").send({
      _csrf: csrfToken,
      title: "Test Question 2",
      EID: latestElection.id,
      desc: "Test Question 2",
      options: ["Option 1", "Option 2", "Option 3"],
    });
    expect(addQuestionResponse.statusCode).toBe(302);

    res = await agent.get(`/admin/election/questions/${latestElection.id}`);
    expect(res.statusCode).toBe(200);
    csrfToken = extractCSRFToken(res);

    addQuestionResponse = await agent.post("/admin/election/questions").send({
      _csrf: csrfToken,
      title: "Test Question 3",
      EID: latestElection.id,
      desc: "Test Question 3",
      options: ["Option 1", "Option 2", "Option 3"],
    });
    expect(addQuestionResponse.statusCode).toBe(302);

    res = await agent.get(`/admin/election/questions/${latestElection.id}`);
    expect(res.statusCode).toBe(200);
    csrfToken = extractCSRFToken(res);

    res = await agent.put(`/admin/election/launch/${latestElection.id}`).send({
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(200);
    // console.log(JSON.parse(res.text))
    expect(JSON.parse(res.text).success).toBe(true);

    res = await agent.get("/admin/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/admin/elections");
    expect(res.statusCode).toBe(302);

    //  Login the Voter
    await loginVoter(agent, "test_voter", "test_voter");
    res = await agent.get("/voter/election");
    expect(res.statusCode).toBe(200);

    //  Logout the Voter
    res = await agent.get("/voter/logout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/voter/election");
    expect(res.statusCode).toBe(302);
  });
});
