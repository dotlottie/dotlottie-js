import fs from 'fs';

import { DotLottie, LottieImageCommon } from '@dotlottie/dotlottie-js';

async function createStarRating() {
  const dotLottie = new DotLottie();
  let star_rating_binding =  fs.readFileSync('bindings/binding_tests_state_machine_numeric_for_star_rating.json', 'utf8');
  const parsed_star_rating_binding = JSON.parse(star_rating_binding);

  await dotLottie
    .addAnimation({
      id: 'star-rating',
      url: 'https://lottie.host/90e7f6e9-462a-4560-b1d7-4cedf81b5421/bWWD1bAgE4.json',
    })
    .addGlobalInputs({
      id: "inputs",
      data: parsed_star_rating_binding
    })
    .addStateMachine({
      id: "starRating",
      name: "Star Rating ⭐",
      data: {
        initial: "global",
        states: [
          {
            name: "global",
            type: "GlobalState",
            transitions: [
              {
                type: "Transition",
                toState: "star_1",
                guards: [
                  {
                    type: "Numeric",
                    conditionType: "Equal",
                    inputName: "rating",
                    compareTo: 1
                  }
                ]
              },
              {
                type: "Transition",
                toState: "star_2",
                guards: [
                  {
                    type: "Numeric",
                    conditionType: "Equal",
                    inputName: "rating",
                    compareTo: 2
                  }
                ]
              },
              {
                type: "Transition",
                toState: "star_3",
                guards: [
                  {
                    type: "Numeric",
                    conditionType: "Equal",
                    inputName: "rating",
                    compareTo: 3
                  }
                ]
              },
              {
                type: "Transition",
                toState: "star_4",
                guards: [
                  {
                    type: "Numeric",
                    conditionType: "Equal",
                    inputName: "rating",
                    compareTo: 4
                  }
                ]
              },
              {
                type: "Transition",
                toState: "star_5",
                guards: [
                  {
                    type: "Numeric",
                    conditionType: "Equal",
                    inputName: "rating",
                    compareTo: 5
                  }
                ]
              }
            ]
          },
          {
            type: "PlaybackState",
            name: "star_1",
            animation: "",
            autoplay: true,
            segment: "star_1",
            transitions: [],
          },
          {
            type: "PlaybackState",
            name: "star_2",
            animation: "",
            autoplay: true,
            segment: "star_2",
            transitions: []
          },
          {
            type: "PlaybackState",
            name: "star_3",
            animation: "",
            autoplay: true,
            segment: "star_3",
            transitions: [],
          },
          {
            type: "PlaybackState",
            name: "star_4",
            animation: "",
            autoplay: true,
            segment: "star_4",
            transitions: []
          },
          {
            type: "PlaybackState",
            name: "star_5",
            animation: "",
            autoplay: true,
            segment: "star_5",
            transitions: []
          }
        ],
        interactions: [
          {
            type: "PointerDown",
            layerName: "star1",
            actions: [
              {
                type: "SetNumeric",
                inputName: "rating",
                value: 1
              },
              {
                type: "SetTheme",
                value: "air"
              },
              {
                type: "FireCustomEvent",
                value: "CustomEvent!"
              },
              {
                type: "OpenUrl",
                url: "https://www.lottiefiles.com",
                target: "_blank"
              }
            ]
          },
          {
            type: "PointerDown",
            layerName: "star2",
            actions: [
              {
                type: "SetNumeric",
                inputName: "rating",
                value: 2
              }
            ]
          },
          {
            type: "PointerDown",
            layerName: "star3",
            actions: [
              {
                type: "SetNumeric",
                inputName: "rating",
                value: 3
              }
            ]
          },
          {
            type: "PointerDown",
            layerName: "star4",
            actions: [
              {
                type: "SetNumeric",
                inputName: "rating",
                value: 4
              }
            ]
          },
          {
            type: "PointerDown",
            layerName: "star5",
            actions: [
              {
                type: "SetNumeric",
                inputName: "rating",
                value: 5
              }
            ]
          }
        ],
        inputs: [
          {
            type: "Numeric",
            name: "rating",
            value: 0
          }
        ]
      }
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      fs.writeFileSync('exports/sm_star_rating.lottie', Buffer.from(value));
    });
}

async function createToggleButton() {
  const dotLottie = new DotLottie();
  let toggle_binding =  fs.readFileSync('bindings/binding_tests_state_machine_boolean_for_toggle.json', 'utf8');
  const parsed_toggle_binding = JSON.parse(toggle_binding);

  await dotLottie
    .addAnimation({
      id: 'toggleBtn',
      url: 'https://lottie.host/8c2590c3-3aaa-4d47-b6cd-1ef979e284f4/2ykhbXYDAc.json',
    })
    .addGlobalInputs({
      id: "inputs",
      data: parsed_toggle_binding
    })
    .addStateMachine({
      id: "toggleButton",
      name: "Toggle Button",
      data: {
        initial: "initial-wait",
        states: [
          {
            name: "initial-wait",
            type: "PlaybackState",
            animation: "",
            transitions: [
              {
                type: "Transition",
                toState: "a",
                guards: [
                  {
                    type: "Boolean",
                    conditionType: "Equal",
                    inputName: "OnOffSwitch",
                    compareTo: true
                  }
                ]
              }
            ]
          },
          {
            name: "a",
            type: "PlaybackState",
            animation: "",
            autoplay: true,
            speed: 2.0,
            transitions: [
              {
                type: "Transition",
                toState: "b",
                guards: [
                  {
                    type: "Boolean",
                    conditionType: "Equal",
                    inputName: "OnOffSwitch",
                    compareTo: false
                  }
                ]
              },
            ],
            entryActions: [
              {
                type: "SetGlobalString",
                globalInputId: "test",
                value: "new value!"
              },
            ]
          },
          {
            name: "b",
            type: "PlaybackState",
            animation: "",
            autoplay: true,
            speed: 2.0,
            mode: "Reverse",
            transitions: [
              {
                type: "Transition",
                toState: "a",
                guards: [
                  {
                    type: "Boolean",
                    conditionType: "Equal",
                    inputName: "OnOffSwitch",
                    compareTo: true
                  }
                ]
              }
            ]
          }
        ],
        interactions: [
          {
            type: "PointerDown",
            actions: [
              {
                type: "Toggle",
                inputName: "OnOffSwitch"
              }
            ]
          }
        ],
        inputs: [
          {
            type: "Boolean",
            name: "OnOffSwitch",
            value: false
          }
        ]
      }
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('exports/sm_toggle_button.lottie', Buffer.from(value));
    });
}


async function createMagicWand() {
  const dotLottie = new DotLottie();
  // --- Start vector
  const wand_animation_data = fs.readFileSync('animations/magic_wand.json', 'utf8');

  // Global inputs
  const vector_global_input = fs.readFileSync('bindings/vector_global_input.json', 'utf8');
  const parsed_vector_global_input = JSON.parse(vector_global_input);

  const wand_state_machine_data = fs.readFileSync('state_machines/wand_sm.json', 'utf8'); 

  const yellow_theme_data = fs.readFileSync('themes/Yellow.json', 'utf8');
  const parsed_yellow_theme = JSON.parse(yellow_theme_data);

  const red_theme_data = fs.readFileSync('themes/Red.json', 'utf8');
  const parsed_red_theme = JSON.parse(red_theme_data);

  const blue_theme_data = fs.readFileSync('themes/Blue.json', 'utf8');
  const parsed_blue_theme = JSON.parse(blue_theme_data);

  const wand_theme_data = fs.readFileSync('themes/wand.json', 'utf8');
  const parsed_wand_theme = JSON.parse(wand_theme_data);


  await dotLottie
    .addAnimation({
      id: 'wand',
      data: JSON.parse(wand_animation_data),
    })
    .addStateMachine({
      id: "wand_sm",
      data: JSON.parse(wand_state_machine_data)
    })
    .addTheme({
      data: parsed_blue_theme,
      id: "Blue",
    })
    .addTheme({
      data: parsed_wand_theme,
      id: "wand",
    })
    .addTheme({
      data: parsed_yellow_theme,
      id: "Yellow",
    })
    .addTheme({
      data: parsed_red_theme,
      id: "Red",
    })
    .addGlobalInputs({
      data: parsed_vector_global_input,
      id: 'inputs'
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('exports/magic_wand.lottie', Buffer.from(value));
    });
}


async function createFallingSquares() {
  const dotLottie = new DotLottie();

  const physics_data = fs.readFileSync('animations/physics.json', 'utf8');

  const physics_theme = fs.readFileSync('themes/physics_theme.json', 'utf8');
  const parsed_physics_theme = JSON.parse(physics_theme);

  
  const physics_binding = fs.readFileSync('bindings/physics_binding.json', 'utf8');
  const parsed_physics_binding = JSON.parse(physics_binding);

  await dotLottie
    .addAnimation({
      id: 'physics',
      data: JSON.parse(physics_data),
    })
    .addTheme({
      data: parsed_physics_theme,
      id: "physics_theme",
    })
    .addGlobalInputs({
      data: parsed_physics_binding,
      id: 'physics_binding'
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('exports/falling_squares.lottie', Buffer.from(value));
    });
}

async function testFromToArrayBuffer() {
  const dotLottie = new DotLottie();

  const physics_data = fs.readFileSync('animations/physics.json', 'utf8');

  const physics_theme = fs.readFileSync('themes/physics_theme.json', 'utf8');
  const parsed_physics_theme = JSON.parse(physics_theme);
  
  const physics_binding = fs.readFileSync('bindings/physics_binding.json', 'utf8');
  const parsed_physics_binding = JSON.parse(physics_binding);

  await dotLottie
    .addAnimation({
      id: 'physics',
      data: JSON.parse(physics_data),
    })
    .addTheme({
      data: parsed_physics_theme,
      id: "physics_theme",
    })
    .addGlobalInputs({
      data: parsed_physics_binding,
      id: 'physics_binding',
      name: "sam"
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      fs.writeFileSync('exports/to_delete.lottie', Buffer.from(value));

      let loadedDotLottie = new DotLottie();

      loadedDotLottie = await loadedDotLottie.fromArrayBuffer(value);
  
      const globalInputsList = loadedDotLottie.getGlobalInputs();

      console.log(">> Global vars: ", globalInputsList);
      
      fs.writeFileSync('exports/test_falling_squares.lottie', Buffer.from(value));
    });
}

async function packageAnimThemeBinding(animationFilename, themeFilename, bindingFilename, exportFilename) {
  console.log(`>> Creating ${exportFilename}`);

  const animation_data = fs.readFileSync(`animations/${animationFilename}.json`, 'utf8');
  const theme_data = fs.readFileSync(`themes/${themeFilename}.json`, 'utf8');
  const global_input_data = fs.readFileSync(`bindings/${bindingFilename}.json`, 'utf8');
  
  const dotLottie = new DotLottie(); 

  await dotLottie
  .addAnimation({
    id: animationFilename,
    data: JSON.parse(animation_data),
  })
   .addTheme({
    data: JSON.parse(theme_data),
    id: 'theme',
  })
  .addGlobalInputs({
    data: JSON.parse(global_input_data),
    id: 'inputs'
  })
  .build()
  .then((value) => {
    return value.toArrayBuffer();
  })
  .then((value) => {
    fs.writeFileSync(`exports/${exportFilename}.lottie`, Buffer.from(value));
    
    console.log(`>> Finished creating ${exportFilename}`);
  });
}

// async function createAnimationWithImages() {
//   const dotLottie = new DotLottie();

//   const ad = fs.readFileSync('animations/bull.json', 'utf8');
//   const id = fs.readFileSync('assets/dithered-image.png').buffer;
//   let image = new LottieImageCommon({
//     data: id,
//     id: "test",
//     lottieAssetId: "test",
//     fileName: "test",
//   });


//   const tests_bull_image_binding = fs.readFileSync('bindings/binding_tests_bull_image.json', 'utf8');
//   const parsed_tests_bull_binding = JSON.parse(tests_bull_image_binding);

//   const bull_theme = fs.readFileSync('themes/test_bull_image_theme.json', 'utf8');
//   const parsed_bull_theme = JSON.parse(bull_theme);


//   await dotLottie
//     .addAnimation({
//       id: 'bull',
//       data: JSON.parse(ad),
//     })
//     .addGlobalInputs({
//       id: "inputs",
//       data: parsed_tests_bull_binding
//     })
//     .addTheme({
//       id: "theme",
//       data: parsed_bull_theme
//     })
//     .addExtraImage(image)
//     .build()
//     .then((value) => {
//       return value.toArrayBuffer();
//     })
//     .then(async (value) => {
//       fs.writeFileSync('exports/test_inputs_bull_image.lottie', Buffer.from(value));
      
//       // let test = new DotLottie()
//       // test = await test.fromArrayBuffer(value);
//       // let theme = await test.getTheme("theme");

//       // console.log(JSON.stringify(theme.data));

//       // console.log();
//     });
// }

// async function createChooseYourDev() {
//   const dotLottie = new DotLottie();

//   const ad = fs.readFileSync('animations/choose_your_dev.json', 'utf8');
//   const afsalImage = fs.readFileSync('assets/afsal.png').buffer;
//   const ashrafImage = fs.readFileSync('assets/ashraf.png').buffer;
//   const georgeImage = fs.readFileSync('assets/george.png').buffer;
//   const samImage = fs.readFileSync('assets/sam.png').buffer;
//   let afsal = new LottieImageCommon({
//     data: afsalImage,
//     id: "afsal",
//     lottieAssetId: "afsal",
//     fileName: "afsal",
//   });
//   let ashraf = new LottieImageCommon({
//     data: ashrafImage,
//     id: "ashraf",
//     lottieAssetId: "ashraf",
//     fileName: "ashraf",
//   });
//   let george = new LottieImageCommon({
//     data: georgeImage,
//     id: "george",
//     lottieAssetId: "george",
//     fileName: "george",
//   });
//   let sam = new LottieImageCommon({
//     data: samImage,
//     id: "sam",
//     lottieAssetId: "sam",
//     fileName: "sam",
//   });

//   const binding = fs.readFileSync('bindings/choose_your_dev.json', 'utf8');
//   const parsed_binding = JSON.parse(binding);

//   const theme = fs.readFileSync('themes/choose_your_dev.json', 'utf8');
//   const parsed_theme = JSON.parse(theme);


//   await dotLottie
//     .addAnimation({
//       id: 'choose_your_dev',
//       data: JSON.parse(ad),
//     })
//     .addGlobalInputs({
//       id: "inputs",
//       data: parsed_binding
//     })
//     .addTheme({
//       id: "theme",
//       data: parsed_theme
//     })
//     .addExtraImage(afsal)
//     .addExtraImage(ashraf)
//     .addExtraImage(george)
//     .addExtraImage(sam)
//     .build()
//     .then((value) => {
//       return value.toArrayBuffer();
//     })
//     .then(async (value) => {
//       fs.writeFileSync('exports/choose_your_dev.lottie', Buffer.from(value));
//     });
// }
        
async function createTestFilesForDotlottieRs() {
  await createMagicWand();

    // --- Start color
    // await packageAnimThemeBinding("test_ball_color", "test_ball_color_theme_animated", "binding_tests_ball_color_animated", "test_inputs_ball_color_animated");
    await packageAnimThemeBinding("test_sheet_gradient", "test_sheet_color_theme_animated", "binding_tests_sheet_color_animated", "test_inputs_sheet_color_animated");
    await packageAnimThemeBinding("test_sheet_gradient", "test_sheet_color_theme_static", "binding_tests_sheet_color_static", "test_inputs_sheet_color_static");
    // --- End color

    // --- Start gradient
    await packageAnimThemeBinding("test_sheet_gradient", "test_sheet_gradient_theme_animated", "binding_tests_sheet_gradient_animated", "test_inputs_sheet_gradient_animated");
    await packageAnimThemeBinding("test_sheet_gradient", "test_sheet_gradient_theme_static", "binding_tests_sheet_gradient_static", "test_inputs_sheet_gradient_static");
    // --- End color

    // --- Start vector
    await packageAnimThemeBinding("test_ball_vector", "test_ball_vector_theme", "binding_tests_ball_vector", "test_inputs_ball_vector");
    // --- End vector
    
  
    // --- Start numeric
    await packageAnimThemeBinding("test_ball_numeric", "test_ball_numeric_theme_static", "binding_tests_ball_numeric_static", "test_inputs_ball_numeric_static");
    await packageAnimThemeBinding("test_ball_numeric", "test_ball_numeric_theme_animated", "binding_tests_ball_numeric_animated", "test_inputs_ball_numeric_animated");
    // --- End color
    
    // --- Add and image to the dotLottie package 
    // await createAnimationWithImages()
    // --- Start image 
  
    // --- Start boolean
    // await packageAnimThemeBinding("test_ball_color", "test_ball_color_theme", "binding_tests_ball_boolean", "test_inputs_ball_boolean");
    // --- End boolean
  
    // --- Start text
    await packageAnimThemeBinding("text", "test_text_theme_static", "binding_tests_text_static", "test_inputs_text_static");
    await packageAnimThemeBinding("text", "test_text_theme_animated", "binding_tests_text_animated", "test_inputs_text_animated");
    // --- End color

    await createStarRating();
    await createToggleButton();
  }
  await createTestFilesForDotlottieRs();
