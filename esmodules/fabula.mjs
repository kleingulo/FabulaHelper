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
		else{
			item.parent.setFlag(FabulaHelper.ID, 'zeroPower', {"value":0, "max":0});
		}
		
	};

	static initialize()
	{
		CONFIG.Actor.trackableAttributes.character.bar.push("parent.flags."+FabulaHelper.ID+".zeroPower");
	}

}

Hooks.on('init', FabulaHelper.initialize);
Hooks.on('preUpdateItem', (item, patch, modified) => FabulaHelper.updateZeroPower(item, patch));