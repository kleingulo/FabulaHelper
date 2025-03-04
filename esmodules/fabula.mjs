class FabulaHelper{
	static ID = 'GuloFabulaHelper';
	
	static updateZeroPower(actor){
		var zero = actor.items.filter((item) => item.system.optionalType == "projectfu.zeroPower")[0]
		if(!!zero)
		{
			var value = zero.system.data.progress.current
			var max = zero.system.data.progress.max
			//actor.system.resources.zero = {"value":value, "max":max};
			actor.setFlag(FabulaHelper.ID, 'zeroPower', {"value":value, "max":max});
		}
		else{
			actor.setFlag(FabulaHelper.ID, 'zeroPower', {"value":0, "max":0});
		}
		
	};

	static initialize()
	{
		CONFIG.Actor.trackableAttributes.character.bar.push("parent.flags."+FabulaHelper.ID+".zeroPower");
	}

}

Hooks.on('init', FabulaHelper.initialize);
Hooks.on('projectfu.actor.dataPrepared', (actor) => FabulaHelper.updateZeroPower(actor));