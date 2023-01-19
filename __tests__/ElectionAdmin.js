/* eslint-disable no-undef */
const request = require("supertest");
const cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;

function extractCSRFToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const login = async (agent, email, password) => {
  let res = await agent.get("/admin/login");
  let csrfToken = extractCSRFToken(res);
  res = await agent.post("/admin/login").send({
    email: email,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Testing Functionalities of Election Admin", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3001, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    await server.close();
  });

  test("Testing SignUp Functionality", async () => {
    let res = await agent.get("/admin/signup");
    const csrfToken = extractCSRFToken(res);
    res = await agent.post("/admin/signup").send({
      _csrf: csrfToken,
      firstname: "Test",
      lastname: "User1",
      username: "user1",
      email: "user1@gmail.com",
      password: "password",
    });
    expect(res.statusCode).toEqual(302);
    res = await agent.get("/admin/elections");
    expect(res.statusCode).toEqual(200);
  });

  test("Testing Sign Out Functionality", async () => {
    let res = await agent.get("/admin/elections");
    expect(res.statusCode).toEqual(200);
    res = await agent.get("/admin/signout");
    expect(res.statusCode).toEqual(302);
    res = await agent.get("/admin/elections");
    expect(res.statusCode).toBe(302);
  });

  test("Testing Login Functionality", async () => {
    await login(agent, "user1@gmail.com", "password");
    let res = await agent.get("/admin/elections");
    expect(res.statusCode).toEqual(200);
  });

  test("Testing Create Election Functionality", async () => {
    const agent = request.agent(server);
    await login(agent, "user1@gmail.com", "password");
    let res = await agent.get("/admin/elections");
    const csrfToken = extractCSRFToken(res);
    res = await agent.post("/admin/election").send({
      _csrf: csrfToken,
      name: "Test Election",
      cstring: "test_election",
    });
    expect(res.statusCode).toEqual(302);
  });

  // Test for Deleting Election
  test("Testing Deleting Election Functionality", async () => {
    const agent = request.agent(server);
    await login(agent, "user1@gmail.com", "password");

    //  Create An Eleciton First
    let res = await agent.get("/admin/elections");
    let csrfToken = extractCSRFToken(res);
    res = await agent.post("/admin/election").send({
      _csrf: csrfToken,
      name: "Test Election 1",
      cstring: "test_election_1",
    });
    expect(res.statusCode).toEqual(302);

    // Fetch the latest Election
    res = await agent.get("/admin/elections").set("Accept", "application/json");
    let latestElection = JSON.parse(res.text).elections[
      JSON.parse(res.text).elections.length - 1
    ];

    // Delete the Election
    res = await agent.get("/admin/elections/");
    csrfToken = extractCSRFToken(res);
    deleteElectionResponse = await agent
      .delete("/admin/elections/" + latestElection.id)
      .send({
        _csrf: csrfToken,
      });

    expect(deleteElectionResponse.statusCode).toEqual(200);
  });

  test("Testing Adding Voter to Election Functionality", async () => {
    const agent = request.agent(server);
    await login(agent, "user1@gmail.com", "password");
    // Create An Eleciton First
    let res = await agent.get("/admin/elections");
    let csrfToken = extractCSRFToken(res);
    res = await agent.post("/admin/election").send({
      _csrf: csrfToken,
      name: "Test Election 9",
      cstring: "test_election_9",
    });
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
    expect(addVoterResponse.statusCode).toEqual(302);
  });

  // Test for Deleting Voter
  test("Testing Deleting Voter Functionality", async () => {
    const agent = request.agent(server);
    await login(agent, "user1@gmail.com", "password");
    // Create An Eleciton First
    let res = await agent.get("/admin/elections");
    let csrfToken = extractCSRFToken(res);
    res = await agent.post("/admin/election").send({
      _csrf: csrfToken,
      name: "Test Election 1",
      cstring: "test_election_1",
    });
    expect(res.statusCode).toEqual(302);

    //  Fetch the latest Election
    res = await agent.get("/admin/elections").set("Accept", "application/json");
    let latestElection = JSON.parse(res.text).elections[
      JSON.parse(res.text).elections.length - 1
    ];
    //  Create a Voter
    res = await agent.get("/admin/election/voters/" + latestElection.id);
    expect(res.statusCode).toBe(200);
    csrfToken = extractCSRFToken(res);
    addVoterResponse = await agent.post("/admin/election/voters").send({
      _csrf: csrfToken,
      voterID: "test_voter_1",
      password: "test_voter_1",
      firstname: "Test Voter 1",
      lastname: "Test Voter 1",
      votername: "Test_Voter",
      EId: latestElection.id,
    });
    expect(addVoterResponse.statusCode).toEqual(302);

    // Fetch the latest Voter
    res = await agent
      .get("/admin/election/voters/" + latestElection.id)
      .set("Accept", "application/json");
    let voters = JSON.parse(res.text).voters;
    let latestVoter = voters[voters.length - 1];

    // Delete the Voter
    res = await agent.get("/admin/elections");
    csrfToken = extractCSRFToken(res);
    deleteVoterResponse = await agent
      .delete(`/admin/election/voters/${latestElection.id}/${latestVoter.id}`)
      .send({
        _csrf: csrfToken,
      });
    expect(deleteVoterResponse.statusCode).toEqual(200);
  });

  test("Testing Adding a Question Functionality", async () => {
    const agent = request.agent(server);
    await login(agent, "user1@gmail.com", "password");

    let res = await agent.get("/admin/elections");
    let csrfToken = extractCSRFToken(res);
    res = await agent.post("/admin/election").send({
      _csrf: csrfToken,
      name: "Test Election 2",
      cstring: "test_election_2",
    });
    expect(res.statusCode).toEqual(302);

    res = await agent.get("/admin/elections").set("Accept", "application/json");
    let latestElection = JSON.parse(res.text).elections[
      JSON.parse(res.text).elections.length - 1
    ];

    res = await agent.get(`/admin/election/questions/${latestElection.id}`);
    expect(res.statusCode).toBe(200);
    csrfToken = extractCSRFToken(res);

    addQuestionResponse = await agent.post("/admin/election/questions").send({
      _csrf: csrfToken,
      title: "Test Question 1",
      EID: latestElection.id,
      desc: "Test Question 1",
      options: ["Test Option 1", "Test Option 2", "Test Option 3"],
    });
    expect(addQuestionResponse.statusCode).toEqual(302);
  });

  test("Testing Deleting a Question Functionality", async () => {
    const agent = request.agent(server);
    await login(agent, "user1@gmail.com", "password");

    let res = await agent.get("/admin/elections");
    let csrfToken = extractCSRFToken(res);
    res = await agent.post("/admin/election").send({
      _csrf: csrfToken,
      name: "Test Election 3",
      cstring: "test_election_3",
    });
    expect(res.statusCode).toEqual(302);

    res = await agent.get("/admin/elections").set("Accept", "application/json");
    let latestElection = JSON.parse(res.text).elections[
      JSON.parse(res.text).elections.length - 1
    ];

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

    res = await agent
      .get(`/admin/election/questions/${latestElection.id}`)
      .set("Accept", "application/json");
    let questions = JSON.parse(res.text).questions;
    let latestQuestion = questions[questions.length - 1];

    res = await agent.get(`/admin/election/questions/${latestElection.id}`);
    csrfToken = extractCSRFToken(res);
    res = await agent
      .delete(
        `/admin/election/question/${latestQuestion.EId}/${latestQuestion.id}`
      )
      .send({
        _csrf: csrfToken,
      });
    expect(res.statusCode).toBe(200);
  });

  test("Testing Starting an Election Functionality", async () => {
    const agent = request.agent(server);
    await login(agent, "user1@gmail.com", "password");

    let res = await agent.get("/admin/elections");
    let csrfToken = extractCSRFToken(res);
    res = await agent.post("/admin/election").send({
      _csrf: csrfToken,
      name: "Test Election 10",
      cstring: "test_election_10",
    });
    expect(res.statusCode).toEqual(302);

    res = await agent.get("/admin/elections").set("Accept", "application/json");
    let latestElection = JSON.parse(res.text).elections[
      JSON.parse(res.text).elections.length - 1
    ];

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
    expect(JSON.parse(res.text).success).toBe(true);
  });

  test("Testing Ending an Election Functionality", async () => {
    const agent = request.agent(server);
    await login(agent, "user1@gmail.com", "password");

    let res = await agent.get("/admin/elections");
    let csrfToken = extractCSRFToken(res);
    res = await agent.post("/admin/election").send({
      _csrf: csrfToken,
      name: "Test Election 11",
      cstring: "test_election_11",
    });
    expect(res.statusCode).toEqual(302);

    res = await agent.get("/admin/elections").set("Accept", "application/json");
    let latestElection = JSON.parse(res.text).elections[
      JSON.parse(res.text).elections.length - 1
    ];

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
    expect(JSON.parse(res.text).success).toBe(true);

    res = await agent.get(`/admin/elections`);
    expect(res.statusCode).toBe(200);
    csrfToken = extractCSRFToken(res);

    res = await agent.put(`/admin/election/stop/${latestElection.id}`).send({
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.text).success).toBe(true);
  });
});
