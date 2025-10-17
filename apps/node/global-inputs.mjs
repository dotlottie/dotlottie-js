import fs from 'fs';

import { DotLottie } from '@dotlottie/dotlottie-js';

async function createMagicWand() {
  const dotLottie = new DotLottie();

  const wand_animation_data = fs.readFileSync('animations/magic_wand.json', 'utf8');

  const wand_state_machine_data = fs.readFileSync('state_machines/wand_sm.json', 'utf8'); 

  const yellow_theme_data = fs.readFileSync('themes/Yellow.json', 'utf8');
  const parsed_yellow_theme = JSON.parse(yellow_theme_data);

  const red_theme_data = fs.readFileSync('themes/Red.json', 'utf8');
  const parsed_red_theme = JSON.parse(red_theme_data);

  const blue_theme_data = fs.readFileSync('themes/Blue.json', 'utf8');
  const parsed_blue_theme = JSON.parse(blue_theme_data);

  const magic_wand_binding_data = fs.readFileSync('bindings/magic_wand_binding.json', 'utf8');
  const parsed_magic_wand_binding = JSON.parse(magic_wand_binding_data);

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
      data: parsed_yellow_theme,
      id: "Yellow",
    })
    .addTheme({
      data: parsed_red_theme,
      id: "Red",
    })
    .addGlobalInputs({
      data: parsed_magic_wand_binding,
      id: 'wand_binding'
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
  
      const globalVarsList = loadedDotLottie.getGlobalInputs();

      console.log(">> Global vars: ", globalVarsList);
      
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

async function createStarRating() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'star-rating',
      url: 'https://lottie.host/90e7f6e9-462a-4560-b1d7-4cedf81b5421/bWWD1bAgE4.json',
    })
    .addGlobalInputs({
      id: "inputs",
      data: {
        "rating": {
          "type": "Scalar",
          "value": 0
        }
      }      
    })
    .addStateMachine({
      id: "starRating",
      name: "starRating",
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
                inputName: "@rating",
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
                    inputName: "@rating",
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
                    inputName: "@rating",
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
                    inputName: "@rating",
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
                    inputName: "@rating",
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
            transitions: []
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
            transitions: []
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
                inputName: "@rating",
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
                inputName: "@rating",
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
                inputName: "@rating",
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
                inputName: "@rating",
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
                inputName: "@rating",
                value: 5
              }
            ]
          }
        ],
      }
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then(async (value) => {
      fs.writeFileSync('exports/test_inputs_star_sm.lottie', Buffer.from(value));
    });
}

async function createToggleButton() {
  const dotLottie = new DotLottie();

  await dotLottie
    .addAnimation({
      id: 'toggleBtn',
      url: 'https://lottie.host/8c2590c3-3aaa-4d47-b6cd-1ef979e284f4/2ykhbXYDAc.json',
    })
    .addGlobalInputs({
      id: "inputs",
      data: {
        "OnOffSwitch": {
          "type": "Boolean",
          "value": false
        }
      }      
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
                    inputName: "@OnOffSwitch",
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
                    inputName: "@OnOffSwitch",
                    compareTo: false
                  }
                ]
              }
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
                    inputName: "@OnOffSwitch",
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
                inputName: "@OnOffSwitch"
              }
            ]
          }
        ],
        inputs: [
        ]
      }
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('exports/test_inputs_toggle_sm.lottie', Buffer.from(value));
    });
}

async function createTestFilesForDotlottieRs() {
  const dotLottie = new DotLottie();


  console.log("[Tests] Building vector example ...")
  
  // --- Start vector
  const wand_animation_data = fs.readFileSync('animations/magic_wand.json', 'utf8');

  // Global inputs
  const vector_global_input = fs.readFileSync('bindings/vector_global_input.json', 'utf8');
  const parsed_vector_global_input = JSON.parse(vector_global_input);

  const red_theme_data = fs.readFileSync('themes/Red.json', 'utf8');
  const parsed_red_theme = JSON.parse(red_theme_data);

  await dotLottie
    .addAnimation({
      id: 'wand',
      data: JSON.parse(wand_animation_data),
    })
     .addTheme({
      data: parsed_red_theme,
      id: "Red",
    })
    .addGlobalInputs({
      data: parsed_vector_global_input,
      id: 'wand_binding'
    })
    .build()
    .then((value) => {
      return value.toArrayBuffer();
    })
    .then((value) => {
      fs.writeFileSync('exports/test_vector_global_input.lottie', Buffer.from(value));
      
      console.log("[Tests] Vector example complete!");
    });

    // name convention:
    // test_[feature]_[animation]_[type]
    // --- Start color
    await packageAnimThemeBinding("test_ball_color", "test_ball_color_theme", "binding_tests_ball_color", "test_inputs_ball_color");
    // --- End color
  
    // --- Start gradient
    await packageAnimThemeBinding("test_ball_gradient", "test_ball_gradient_theme", "binding_tests_ball_gradient", "test_inputs_ball_gradient");
    // --- End color
  
    // --- Start scalar
    await packageAnimThemeBinding("test_ball_scalar", "test_ball_scalar_theme", "binding_tests_ball_scalar", "test_inputs_ball_scalar");
    // --- End color
    
    // --- Add and image to the dotLottie package 
    // --- Start image 
  
    // --- Start booleanz
    await packageAnimThemeBinding("test_ball_color", "test_ball_color_theme", "binding_tests_ball_boolean", "test_inputs_ball_boolean");
    // --- End color
  
    // --- Start text
    await packageAnimThemeBinding("test_text", "test_text_theme", "binding_tests_text", "test_inputs_text");
    // await packageAnimThemeBinding("test_text", "test_text_theme", "binding_tests_text", "text_text");
    // --- End color

    await createStarRating();
    await createToggleButton();
  }
  


  

createTestFilesForDotlottieRs();
// createFallingSquares();
// createMagicWand();
// testFromToArrayBuffer();
// createFallingSquares();
// createThemedDotLottie();

// Image { value: ImageValue },
// Text { value: String },

/// Boolean { value: bool },
/// Scalar { value: f64 },
/// Color { value: [f64; 3] },
/// Vector { value: [f64; 2] },
/// Gradient { value: Vec<[f64; 4]> },