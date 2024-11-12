const BACKEND_URL = "http://localhost:3000";
const axios = require("axios");
describe("Authentication ", () => {
  test("User is able to sign-up only once ", async () => {
    const username = `pratham+${Math.random()};`;
    const password = "12356";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    expect(response.status).toBe(200);
    const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    expect(updatedResponse.status).toBe(400);
  });

  test("Signup request fails if username is empty ", async () => {
    const username = `pratham+${Math.random()}`;
    const password = "123457";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password,
    });

    expect(response.status).toBe(400);
  });

  test("Signin succeeds if the username and asssword are corect ", async () => {
    const username = `pratham+${Math.random()}`;
    const password = "123457";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });
    expect(response.status).toBe(200);
    expect(response.date.token).toBeDefined();
  });
  test("Sign in fails if the username and password are incorrect", async () => {
    const username = `pratham+${Math.random()}`;
    const password = "123457";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: "WrongUsername",
      password,
    });

    expect(response.status).toBe(403);
  });
});

describe("User metadata endpoint", () => {
  let token = "";
  let avatarId = "";

  beforeAll(async () => {
    const username = `pratham+${Math.random()};`;
    const password = "12356";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });
    token = response.data.token;

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        authorization: ` Bearer ${token}`,
      }
    );
    console.log("avatarresponse is " + avatarResponse.data.avatarId);

    avatarId = avatarResponse.data.avatarId;
  });

  test("User cant update their metadata with the right avatar id", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/matadata`,
      {
        avatarId: "dfhhgfiuighefiu",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    expect(response.status).toBe(400);
  });

  test(" User can update their metadata with the right avatar id ", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId,
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    expect(response.status).toBe(200);
  });
  test("Use is not able to update their metadata if the auth is not present", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avatarId,
    });
    expect(response.status).toBe(403);
  });
});

describe("User avatar information", () => {
  let avatarId;
  let userId;
  let token;

  beforeAll(async () => {
    const username = `pratham+${Math.random()};`;
    const password = "12356";
    const SignUpresponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    userId = SignUpresponse.data.userId;

    console.log("userid is " + userId);

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });
    token = response.data.token;

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    avatarId = avatarResponse.data.avatarId;
  });

  test("Get back avatar information for a user ", async () => {
    console.log("asking for user with id " + userId);
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`
    );
    console.log("response was" + userId);
    console.log(JSON.stringify(response.data));
    expect(response.data.avatars.length).toBe(1);
    expect(response.data.avatars[0].userId).toBe(userId);
  });
  test("Available avatars lists the recently created avatar", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
    expect(response.data.avatars.length).not.toBe(0);
    const currentAvatar = response.data.avatars.find((x) => x.id == avatarId);
    expect(currentAvatar).toBeDefined();
  });
});

describe("Space information", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminToken;
  let adminId;
  let UserToken;
  let UserId;

  beforeAll(async () => {
    const username = `pratham+${Math.random()};`;
    const password = "12356";
    const SignUpresponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    adminId = SignUpresponse.data.adminId;

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    adminToken = response.data.token;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username: username + " -user",
        password,
        type: "user",
      }
    );

    UserId = userSignupResponse.data.userId;

    const userSigninResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username: username + " -user",
        password,
      }
    );
    UserToken = userSigninResponse.data.token;
    const element1Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const element2Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    element1Id = element1Response.data.id;
    element2Id = element1Response.data.id;
    console.log(element1Id);
    console.log(element1Id);
    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "Test space",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 1,
            y: 20,
          },
        ],
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    console.log(mapResponse.status);
    console.log(mapResponse.data.id);

    mapId = mapResponse.data.id;
  });

  test("User is able to create a new space", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/apt/v1/space`,
      {
        name: "test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${UserToken}`,
        },
      }
    );

    expect(response.data.spaceId).toBeDefined();
    expect(response.data.status).toBe(200);
  });

  test("USer is able to create a space without mapID (empty space)", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${UserToken}`,
        },
      }
    );

    expect(response.data.spaceId).toBeDefined();
  });

  test("User is able to ceate a space without a maId and dimensions", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
      },
      {
        headers: {
          authorization: `Bearer ${UserToken}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });

  test("User is not able to delete the space which does not exist ", async () => {
    const response = await axios.delete(
      `${BACKEND_URL}/api/v1/space/randomIdDoesntExist`,
      {
        headers: {
          authorization: `Bearer ${UserToken}`,
        },
      }
    );

    expect(response.status).toBe(400);
  });

  test("USer is able to delete a space that does exist", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${UserToken}`,
        },
      }
    );
    const deleteResponse = await axios.delete(
      `${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,
      {
        headers: {
          authorization: `Bearer ${UserToken}`,
        },
      }
    );

    expect(deleteResponse.status).toBe(200);
  });

  test("User should not be able to delete a space created by another user", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: ` Bearer ${UserToken}`,
        },
      }
    );

    const deleteResponse = await axios.delete(
      `${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,
      {
        headers: { authorization: `Bearer ${adminToken}` },
      }
    );

    expect(deleteResponse.status).toBe(403);
  });
  test("Admin has no spaces intially", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.data.spaces.length).toBe(0);
  });

  test("Admin has gets once space after", async () => {
    const spaceCreateResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    console.log("asjdlkjdjae");
    console.log(spaceCreateResponse.data);
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });
    const filteredSpace = response.data.spaces.find(
      (x) => x.id == spaceCreateResponse.data.spaceId
    );
    expect(response.data.spaces.length).toBe(1);
    expect(filteredSpace).toBeDefined();
  });
});

describe("Arena end points ", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let UserToken;
    let UserId;
  
    beforeAll(async () => {
      const username = `pratham+${Math.random()};`;
      const password = "12356";
      const SignUpresponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password,
        type: "admin",
      });
      adminId = SignUpresponse.data.adminId;
  
      const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username,
        password,
      });
  
      adminToken = response.data.token;
  
      const userSignupResponse = await axios.post(
        `${BACKEND_URL}/api/v1/signin`,
        {
          username: username + " -user",
          password,
          type: "user",
        }
      );
  
      UserId = userSignupResponse.data.userId;
  
      const userSigninResponse = await axios.post(
        `${BACKEND_URL}/api/v1/signin`,
        {
          username: username + " -user",
          password,
        }
      );
      UserToken = userSigninResponse.data.token;
      const element1Response = await axios.post(
        `${BACKEND_URL}/api/v1/admin/element`,
        {
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
          width: 1,
          height: 1,
          static: true,
        },
        {
          headers: {
            authorization: `Bearer ${adminToken}`,
          },
        }
      );
  
      const element2Response = await axios.post(
        `${BACKEND_URL}/api/v1/admin/element`,
        {
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
          width: 1,
          height: 1,
          static: true,
        },
        {
          headers: {
            authorization: `Bearer ${adminToken}`,
          },
        }
      );
      element1Id = element1Response.data.id;
      element2Id = element1Response.data.id;
      console.log(element1Id);
      console.log(element1Id);
      const mapResponse = await axios.post(
        `${BACKEND_URL}/api/v1`,
        {
          thumbnail: "https://thumbnail.com/a.png",
          dimensions: "100x200",
          name: "Test space",
          defaultElements: [
            {
              elementId: element1Id,
              x: 20,
              y: 20,
            },
            {
              elementId: element2Id,
              x: 18,
              y: 20,
            },
            {
              elementId: element2Id,
              x: 1,
              y: 20,
            },
          ],
        },
        {
          headers: {
            authorization: `Bearer ${adminToken}`,
          },
        }
      );
  
      console.log(mapResponse.status);
      console.log(mapResponse.data.id);
  
      mapId = mapResponse.data.id;
      const spaceCreateResponse= await axios.post(`${BACKEND_URL}/api/v1/space`,{
        "name":"Test ",
        "dimesnions":"100x200",
        "mapID":mapId
      },{
        headers:{
            authorization:  `Bearer ${UserToken}`
        }
      })
      console.log(spaceCreateResponse.data);
      spaceId=spaceCreateResponse.data.spaceId;

    });

    test('InCorrect spaceId returns a 400 ', async () => { 
        const response=await axios.get(`${BACKEND_URL}/api/v1/space/13232434`,{
            headers:{
                authorization:`${UserToken}`
            }
        })
        expect(response.status).toBe(400)
     })

     test('Correct spaceId must return all the elements', async () => { 
        const response= await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers:{
                authorization:`Bearer ${UserToken}`
            }
        });
        console.log(response.data)
        expect(response.data.dimensions).toBe("100x200")
        expect(response.data.elements.length).toBe(3)

      })
      test('Delete endpoint is able to delete an element ', async () => { 
        const response=await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers:{
                authorization:`Bearer ${UserToken}`
            }
        });
         
        console.log(response.data.elements[0].id)
        let res =await axios.delete(`${BACKEND_URL}/api/v1/space/element`,{
            data:{id:response.data.elements[0].id},
            headers:{
                authorization:`Bearer  ${UserToken}`
            }
        })

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers:{
                authorization:`Bearer ${UserToken}`
            }
        });

        expect(newResponse.data.elements.length).toBe(2)



        
       })
 
  
    test('Adding an new elements fails if the element lies outside the dimensions ', async () => { 
        const newResponse=await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
            "elementId":element1Id,
            "spaceId":spaceId,
            "x":1020200,
            "y":232324
        },{
            headers:{
                authorization:`Bearer ${UserToken}`
            }
        });
        expect(newResponse.status).toBe(400)



     })

     test('adding an element works as expected', async () => { 
        const response= await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
            "elementId":element1Id,
            "x":50,
            "y":20
        },{
            headers:{
                authorization:`Bearer ${UserToken}`
            }
        })

        const newResponse=await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            headers:{
                authorization:`Bearer ${ UserToken}`
            }

        })
        expect(newResponse.data.elements.length).toBe(3)

        


      })
})


describe('Admin endpoints', () => {
    let adminToken;
    let adminId;
    let UserToken;
    let UserId;
    beforeAll(async () => {
        const username = `pratham+${Math.random()};`;
        const password = "12356";
        const SignUpresponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
          username,
          password,
          type: "admin",
        });
        adminId = SignUpresponse.data.adminId;
    
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
          username,
          password,
        });
    
        adminToken = response.data.token;
    
        const userSignupResponse = await axios.post(
          `${BACKEND_URL}/api/v1/signin`,
          {
            username: username + " -user",
            password,
            type: "user",
          }
        );
    
        UserId = userSignupResponse.data.userId;
    
        const userSigninResponse = await axios.post(
          `${BACKEND_URL}/api/v1/signin`,
          {
            username: username + " -user",
            password,
          }
        );
        UserToken = userSigninResponse.data.token;
    })
    test('User is not able to hit the admin endpoint', async () => { 
        const elementResponse=await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width":1,
            "height":1,
            "static":ture

        },{
            headers:{
                authorization:`Bearer ${UserToken}`
            }
        })

        const mapResponse=await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions":"100x200",
            "name":"test space",
            "defaultElements":[]

        },{
            headers:{
                authorization:`Bearer ${UserToken}`
            }
        })

        const avatarResponse= await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name":"timmy"
        },{
            headers:{
                authorization:`Bearer ${UserToken}`
            }
        })

        const updateElementResponse=await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
          "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
           
        },{
          headers:{
            authorization:`Bearer${UserToken}`
          }
        })

        expect(elementResponse.status).toBe(403)
        expect(mapResponse.status).toBe(403)
        expect(avatarResponse.status).toBe(403)
        expect(updateElementResponse.status).toBe(403)







     })


     test('admin is able to hit the admin endpoint', async () => { 
      const elementResponse=await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
          "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
          "width":1,
          "height":1,
          "static":ture

      },{
          headers:{
              authorization:`Bearer ${adminToken}`
          }
      })

      const mapResponse=await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
          "thumbnail": "https://thumbnail.com/a.png",
          "dimensions":"100x200",
          "name":"test space",
          "defaultElements":[]

      },{
          headers:{
              authorization:`Bearer ${adminToken}`
          }
      })

      const avatarResponse= await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
          "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
          "name":"timmy"
      },{
          headers:{
              authorization:`Bearer ${adminToken}`
          }
      })

      

      expect(elementResponse.status).toBe(200)
      expect(mapResponse.status).toBe(200)
      expect(avatarResponse.status).toBe(200)
})

      test('admin is able to update the image for an element', async () => { 
        const elementResponse=await axios.post(`${BACKEND_URL}/api/v1/adin/element`,{
          "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
          "width":1,
          "height":1,
          "static":true

        },{
          headers:{
            authorization: `Bearer ${adminToken}`
          }
        })



        const updateElementResponse=await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
          "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
           
        },{
          headers:{
            authorization:`Bearer${adminToken}`
          }
        })
        expect(updateElementResponse.status).toBe(200)

       })
  
});
