

class FabulaHelper{
	static ID = 'GuloFabulaHelper';
	
	static updateZeroPower(item, patch){
		if(item.system.optionalType == "projectfu.zeroPower")
		{
			var value = patch.system.data.progress.current
			var max = item.system.data.progress.max
			//actor.system.resources.zero = {"value":value, "max":max};
			item.parent.setFlag(FabulaHelper.ID, 'zeroPower', {"value":value, "max":max});
		}
		
	};

	static initialize()
	{
    CONFIG.Actor.trackableAttributes.character.bar.push("parent.flags."+FabulaHelper.ID+".zeroPower");
    CONFIG.Canvas.layers["jrpgParty"] = {
      layerClass: JRPGPartyLayer,
      group: "interface"
    };
    Hooks.once("ready", () => {
      console.log("Registering GuloFabulaHelper socket after ready");
      game.socket.on("module.GuloFabulaHelper", (data) => {
        console.log("GuloFabulaHelper socket received:", data);
        if (data.action === "redraw") {
          if (canvas.jrpgParty) {
            canvas.jrpgParty.redrawAll();
          }
        }
      });
    });
  }

  static update_clients() {
    console.log("FabulaHelper: emitting redraw to all clients");
    game.socket.emit("module.GuloFabulaHelper", { action: "redraw"});
  }
}


function processCheckHook(check, actor, item)
{
  // Trigger the item roll
	if (item.hasMacro())
	{
		fireMacro(item.parent, item);
	}
}

function chatMessageHook(chatMessage, speaker, mod)
{
	if('projectfu' in chatMessage.flags)
	{
		if('Item' in chatMessage.flags.projectfu)
		{
			var item = chatMessage.flags.projectfu.Item;
			if(item.type == "optionalFeature")
			{
				if (item.hasMacro())
				{
					fireMacro(item.parent, item);
				}
			}
		}
	}
};

function fireMacro(actor, item)
{
	var protoname = actor.prototypeToken.name;
	var src = canvas.tokens.ownedTokens.find((token) => token.name == protoname);
	var count = 0;
	if(item.system.hasOwnProperty("targeting"))
	{
		if(item.system.targeting.rule == "self")
			{
				item.executeMacro({"src":src, "tgt":null, "cnt":0, "max":1});
			}
	}
	
	game.user.targets.ids.forEach((targetid) => {
	var tgt = canvas.tokens.get(targetid);
	item.executeMacro({"src":src, "tgt":tgt, "cnt":count, "max":game.user.targets.ids.length});
	count = count+1;
	});
};

window.FabulaHelper = FabulaHelper;

class JRPGPartyLayer extends CanvasLayer {
  static group = "interface";
  
  constructor() {
    super();
    this.bars = new Map();
    this.fontReady = document.fonts.load("64px 'Pixel Operator'");
    this.topbox = null;
  }

  _draw(options) {
    this.redrawAll();
    return this;
  }


  makeGradientTexture(width, height, colors) {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    const ctx = c.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    const step = 1 / (colors.length - 1);
    colors.forEach((col, i) => gradient.addColorStop(i * step, col));

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return PIXI.Texture.from(c);
  }


  drawBox(x, y, width, height)
  {
    const bggradient = this.makeGradientTexture(width, height, ["#070ee4", "#000000"]);
    const box = new PIXI.Sprite(bggradient)
    box.x = x;
    box.y = y;

    //border
    const border = new PIXI.Graphics();
    border.lineStyle(4, 0xffffff, 1);
    border.drawRoundedRect(0, 0, width, height, 6);
    border.endFill();
    
    //mask
    const mask = new PIXI.Graphics();
    mask.beginFill(0xffffff);
    mask.drawRoundedRect(0, 0, width, height, 6);
    mask.endFill();
    box.addChild(mask);
    box.mask = mask;

    box.addChild(border);
    this.addChild(box);

    return box;
  }

  drawBackground(x, y, width, height) {
    const bggradient = this.makeGradientTexture(width, height, ["#070ee4", "#000000"]);
    const bg = new PIXI.Sprite(bggradient)
    bg.x = x;
    bg.y = y;

    //border
    const border = new PIXI.Graphics();
    border.lineStyle(4, 0xffffff, 1);
    border.drawRoundedRect(0, 0, width, height, 6);
    border.endFill();
    
    //mask
    const mask = new PIXI.Graphics();
    mask.beginFill(0xffffff);
    mask.drawRoundedRect(0, 0, width, height, 6);
    mask.endFill();
    bg.addChild(mask);
    bg.mask = mask;
    
    //caption
    const HP = PIXI.Sprite.from('modules/GuloFabulaHelper/assets/HP.png');
    const MP = PIXI.Sprite.from('modules/GuloFabulaHelper/assets/MP.png');
    const ZP = PIXI.Sprite.from('modules/GuloFabulaHelper/assets/ZP.png');

    HP.y = 12;
    HP.x = 360;
    MP.y = 12;
    MP.x = 360 + 128 + 38;
    ZP.y = 12;
    ZP.x = 360 + 128 + 38 + 128 + 38;
    bg.addChild(HP);
    bg.addChild(MP);
    bg.addChild(ZP);
    bg.addChild(border);
    return bg;
  }

  drawBar(val, max, color, barWidth, barHeight, color2) {
    if (val === undefined || val === null || max === undefined || max === null) return null;
    let pct = Math.clamped(val / max, 0, 1);

    if(color2) color = this.lerpColor(color, color2, pct);

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.6);
    bg.lineStyle(1, 0x000000, 1, 1);
    bg.drawRoundedRect(0, 0, barWidth, barHeight, 1);
    bg.endFill();

    const g = new PIXI.Graphics();
    g.beginFill(color, 1);
    g.drawRoundedRect(0, 0, barWidth * pct, barHeight, 1);
    g.endFill();

    bg.addChild(g);

    return bg;
  }


drawFlavourMenu() {
  // Flavour-Menu
  const flmenu = new PIXI.Container();
  const flgradient = this.makeGradientTexture(166, 176, ["#070ee4", "#000000"]);
  const flbg = new PIXI.Sprite(flgradient)
  const sprite = PIXI.Sprite.from('modules/GuloFabulaHelper/assets/Menu_03.png');
  
  sprite.y = 10;
  sprite.x = 5;

  //border
  const flborder = new PIXI.Graphics();
  flborder.lineStyle(4, 0xffffff, 1);
  flborder.drawRoundedRect(0, 0, 166, 176, 5);
  flborder.endFill();
  //mask
  const flmask = new PIXI.Graphics();
  flmask.beginFill(0xffffff);
  flmask.drawRoundedRect(0, 0, 166, 176, 6);
  flmask.endFill();
  flbg.addChild(flmask);
  flbg.mask = flmask;

  flmenu.x = 30;
  flmenu.y = -20;
  flbg.addChild(sprite);
  flbg.addChild(flborder);
  flmenu.addChild(flbg);
  return flmenu;
}

lerpColor(color1, color2, t) {
  const c1 = PIXI.utils.hex2rgb(color1);
  const c2 = PIXI.utils.hex2rgb(color2);

  const r = c1[0] + (c2[0] - c1[0]) * t;
  const g = c1[1] + (c2[1] - c1[1]) * t;
  const b = c1[2] + (c2[2] - c1[2]) * t;

  return PIXI.utils.rgb2hex([r, g, b]);
}

makeBlink(displayObject) {
  const ticker = PIXI.Ticker.shared;
  let direction = -1;
  
  const blink = (delta) => {
    displayObject.alpha += direction * 0.01 * delta;
    if (displayObject.alpha <= 0.5) direction = 1;
    if (displayObject.alpha >= 1.0) direction = -1;
  };

  ticker.add(blink);

  // Optional: merken, damit du den Effekt wieder stoppen kannst
  displayObject._blink = blink;
}

makeBrightBlink(displayObject) {
  const filter = new PIXI.filters.ColorMatrixFilter();
  displayObject.filters = [filter];

  const ticker = PIXI.Ticker.shared;
  let elapsed = 0;

  const blink = (delta) => {
    elapsed += delta / 60;
    const brightness = 1 + 0.5 * Math.sin(elapsed * 4); 
    filter.brightness(brightness, false);
  };

  ticker.add(blink);
  displayObject._blink = blink;
}

stopBlink(displayObject) {
  if (displayObject._blink) {
    PIXI.Ticker.shared.remove(displayObject._blink);
    delete displayObject._blink;
    displayObject.alpha = 1.0; // zurücksetzen
  }
}

drawCharBars(actor, idx) {
  const charBars = new PIXI.Container();

    // Ressourcenwerte
    const hp = getProperty(actor, "system.resources.hp");
    const mp = getProperty(actor, "system.resources.mp");
    const zero = actor.getFlag(FabulaHelper.ID, 'zeroPower');

    let barX = 360;
    let barY = 36 + (28 * idx);
    let barWidth = 128;
    let barHeight = 18;
    let barSpacing = 38;


    const barStyle = {
        trim: true, 
        fontSize: 18, 
        fontFamily: "Signika", 
        fill: "#ffffff", 
        stroke: "#000000", 
        strokeThickness: 2
    }

    //name
    const namesprite = PIXI.Sprite.from(`modules/GuloFabulaHelper/assets/${actor.name}.png`);
    if (namesprite)
    {
      namesprite.x = 210;
      namesprite.y = barY+3;
      charBars.addChild(namesprite);
    }

    // HP (rot)
    const hpBar = this.drawBar(hp?.value, hp?.max, 0xff0000, barWidth, barHeight);
    if (hpBar) {
      if (hp?.value / hp?.max <= 0.50) {
        this.makeBlink(hpBar.children[0]);
      } else {
        this.stopBlink(hpBar.children[0]);
      }
      hpBar.position.set(barX, barY);
      charBars.addChild(hpBar);

      const txt = new PIXI.Text(`${hp.value}/${hp.max}`, barStyle);

      txt.resolution = 5;
      txt.anchor.x = 0.5;
      txt.x = hpBar.width/2;
      hpBar.addChild(txt);

      barX += barWidth + barSpacing;
    }

    // MP (blau)
    const mpBar = this.drawBar(mp?.value, mp?.max, 0x80B3FF, barWidth, barHeight);
    if (mpBar) {
      mpBar.position.set(barX, barY);
      charBars.addChild(mpBar);

      const txt = new PIXI.Text(`${mp.value}/${mp.max}`, barStyle);

      txt.resolution = 5;
      txt.anchor.x = 0.5;
      txt.x = mpBar.width/2;
      mpBar.addChild(txt);

      barX += barWidth + barSpacing;
    }

    // zero (gelb)
    const cBar = this.drawBar(zero?.value, zero?.max, 0xFFFFE0, barWidth, barHeight, 0xffff00);
    if (cBar) {
      if (zero?.value == zero?.max) {
        this.makeBrightBlink(cBar.children[0]);
      } else {
        this.stopBlink(cBar.children[0]);
      }
      cBar.position.set(barX, barY);
      charBars.addChild(cBar);

      const txt = new PIXI.Text(`${zero.value}/${zero.max}`, barStyle);

      txt.resolution = 5;
      txt.anchor.x = 0.5;
      txt.x = cBar.width/2;
      cBar.addChild(txt);
    }
    // Position Panel
    //container.position.set(startX + idx * (panelWidth + spacing), startY);
    return charBars;
  }

  actionNameBox(name)
  {
    const text = new PIXI.Text(name, {
      fontFamily: "Pixel Operator",
      fontSize: 48,
      fill: "#ffffff",          // Textfarbe
      stroke: "#000000",        // Konturfarbe
      strokeThickness: 3,       // Konturstärke
      dropShadow: true,         // optional
      dropShadowColor: "#000000",
      dropShadowDistance: 2
    });
    text.anchor.x = 0.5;
    text.anchor.y = 0.5;
    text.resolution = 5;
    text.roundPixels = true;

    var panelWidth = 840;
    text.x = panelWidth / 2;
    text.y = 40;
    var box = this.drawBox(canvas.scene.dimensions.width/2 - panelWidth/2, canvas.scene.getDimensions().sceneY + 50 + 5*60, panelWidth, 80);
    box.addChild(text);
  }

  redrawAll() {
    this.removeChildren();
    this.bars.clear();
    const heroes = canvas.scene.getFlag(FabulaHelper.ID, 'heroes');
    if(!heroes) return;

    //const actors = game.actors.filter(a => a.hasPlayerOwner);
    const actors = heroes
      .map(id => game.actors.get(id))
      .filter(a => !!a);
    if (!actors.length) return;

    const sceneWidth = canvas.scene.dimensions.width;
    const sceneHeight = canvas.scene.dimensions.sceneHeight;


    const panelWidth = 840;
    const panelHeight = 240;
    const menuX = sceneWidth/2 - panelWidth/2;
    const menuY = canvas.scene.dimensions.sceneY + sceneHeight - panelHeight - 40;

    const menu = new PIXI.Container();
    menu.x = menuX;
    menu.y = menuY;

    menu.addChild(this.drawBackground(0, 0, panelWidth, panelHeight - 60));

    const flmenu = this.drawFlavourMenu();
    menu.addChild(flmenu);


    actors.forEach((actor, idx) => {
      const charBars = this.drawCharBars(actor, idx);

      menu.addChild(charBars);
      this.bars.set(actor.id, charBars);
    
    });
    this.addChild(menu);
    const actionText = canvas.scene.getFlag(FabulaHelper.ID, 'actionText');
    if(actionText) this.actionNameBox(actionText);
  }


  setbox(name)
  {
    canvas.scene.setFlag(FabulaHelper.ID, "actionText", name);
  }

  clearbox()
  {
    this.setbox("");
  }

};

Hooks.once('init', FabulaHelper.initialize);
Hooks.once('ready', () => {game.settings.set("barbrawl","heightMultiplier", 2);});
Hooks.on('preUpdateItem', (item, patch, modified) => FabulaHelper.updateZeroPower(item, patch));
Hooks.on("projectfu.processCheck", processCheckHook);
Hooks.on("preCreateChatMessage", chatMessageHook);
Hooks.on("updateScene", (scene, update) => {
  if (update.flags?.GuloFabulaHelper?.actionText !== undefined) {
    canvas.jrpgParty?.redrawAll();
  }
});

// Neu zeichnen bei Änderungen
Hooks.on("updateActor", () => canvas.jrpgParty?.redrawAll());
//Hooks.on("createToken", () => canvas.jrpgParty?.redrawAll());
Hooks.on("updateToken", () => canvas.jrpgParty?.redrawAll());
//Hooks.on("deleteToken", () => canvas.jrpgParty?.redrawAll());
