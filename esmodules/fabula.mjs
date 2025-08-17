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
}

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
}

Hooks.on('init', FabulaHelper.initialize);
Hooks.once('ready', () => {game.settings.set("barbrawl","heightMultiplier", 2);});
Hooks.on('preUpdateItem', (item, patch, modified) => FabulaHelper.updateZeroPower(item, patch));
Hooks.on("projectfu.processCheck", processCheckHook);
Hooks.on("preCreateChatMessage", chatMessageHook);
