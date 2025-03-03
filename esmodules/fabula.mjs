function updateZeroPower(actor){
	var zero = actor.items.filter((item) => item.system.fuid == "ZeroPower")[0]
	var value = zero.system.data.progress.current
	var max = zero.system.data.progress.max
	//actor.system.resources.zero = {"value":value, "max":max};
	actor.setFlag('FabulaHelper', 'zero', {"value":value, "max":max});
};

//CONFIG.Actor.trackableAttributes.character.bar.push("resources.zero");
CONFIG.Actor.trackableAttributes.character.bar.push("parent.flags.FabulaHelper.zero");
Hooks.on('projectfu.actor.dataPrepared', (actor) => updateZeroPower(actor));