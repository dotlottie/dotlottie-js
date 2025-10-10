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
    .addGlobalVariables({
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
    .addGlobalVariables({
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
    .addGlobalVariables({
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
  
      const globalVarsList = loadedDotLottie.getGlobalVariables();

      console.log(">> Global vars: ", globalVarsList);
      
      fs.writeFileSync('exports/test_falling_squares.lottie', Buffer.from(value));
    });
}

// createFallingSquares();
// createMagicWand();
testFromToArrayBuffer();
// createFallingSquares();
// createThemedDotLottie();