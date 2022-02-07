/*
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

var TraderBot = {};
TraderBot.launchMod = function() {
	var TraderBot = this;
	var M = Game.Objects['Bank'].minigame;
	TraderBot.buyAt = Array(M.goodsById.length).fill(0);
	TraderBot.sellAt = Array(M.goodsById.length).fill(0);

	TraderBot.init = function() {
		var str = '';
		str +='<style>'+
		'.traderBotButtonBox{position:absolute;left:-1px;bottom:0px;overflow:hidden;z-index:10;}'+
		'.traderBotButton{background:rgba(0,0,0,0.25);box-shadow:-1px -1px 0px rgba(255,255,255,0.25),0px 0px 1px 1px rgba(0,0,0,0.5) inset;border-top-left-radius:4px;border-top-right-radius:4px;padding:4px 8px;font-size:11px;font-weight:bold;color:#ccc;	text-shadow:1px 1px 0px #000,-1px 1px 0px #000,1px -1px 0px #000,-1px -1px 0px #000;cursor:pointer;float:left;position:relative;margin-left:2px;margin-top:2px;min-height:11px;}'+
		'.traderBotButton:hover{background:rgba(0,0,0,0.5);color:#fff;}'+
		'#prompt.sectionMiddlePrompt{width:calc(67vw - 318px);left:-250px;}'+
		'</style>';

		str += '<div id="traderBotContent" class="traderBotButtonBox">'+
				'<div id="traderBotConfigButton" class="traderBotButton" onClick="TraderBot.showConfig()">TraderBot Config</div>'+
			'</div>';

		l('row'+Game.Objects['Bank'].id).getElementsByClassName('productButtons')[0].insertAdjacentHTML("beforebegin", str);
		
		Game.registerHook('check', TraderBot.checkHook)
	};

	TraderBot.save = function() {
		return JSON.stringify(TraderBot);
	};

	TraderBot.load = function(str) {
		var loadedObject = JSON.parse(str);
		TraderBot.buyAt = loadedObject.buyAt;
		TraderBot.sellAt = loadedObject.sellAt;
	};


	TraderBot.checkHook = function() {
		for (var i = 0; i < M.goodsById.length; i++) {
			var me = M.goodsById[i];
			if (TraderBot.buyAt[i] > 0 && me.val < TraderBot.buyAt[i]) {
				M.buyGood(i, 10000);
			}
			if (TraderBot.sellAt[i] > 0 && me.val > TraderBot.sellAt[i]) {
				M.sellGood(i, 10000);
			}
		}
	}

	TraderBot.showConfig = function() {
		var str = '';
		str += '<h4>Set buy/sell prices here</h4>'+
		'<div class="line"></div>'+
		'<div style="max-height:400px;overflow-y: scroll;">';
		for (var i=0;i<M.goodsById.length;i++)
		{
			var me=M.goodsById[i];
			str+='<div class="bankGood">'+
				'<div>'+
					'<div class="icon" style="z-index:20;pointer-events:none;position:absolute;left:0px;top:0px;transform:scale(0.5);margin:-16px -16px;background-position:'+(-me.icon[0]*48)+'px '+(-me.icon[1]*48)+'px;"></div>'+
					'<div class="bankSymbol" style="margin:1px 0px;display:block;padding:2px 0px;width:100%;overflow:hidden;white-space:nowrap;">'+me.symbol+'</div>'+
					'<div class="bankSymbol" style="margin:1px 0px;display:block;font-size:10px;width:100%;background:linear-gradient(to right,transparent,#333,#333,transparent);padding:2px 0px;overflow:hidden;white-space:nowrap;">Resting value: <span style="color:#fff;" id="bankGood-'+me.id+'-val">'+M.getRestingVal(i)+'</span></div>'+
				'</div>'+
				'<div style="position:relative;white-space:nowrap;">'+
					'<div>'+
						'<div style="padding:3px 3px;width:40px;" class="bankSymbol">Buy at</div>'+
						'<div style="display:inline-block;width:calc(100% - 46px)"><input type="number" id="buyAtInput-'+me.id+'" min="0" value="'+TraderBot.buyAt[i]+'"/></div>'+
					'</div>'+
					'<div>'+
						'<div style="padding:3px 3px;width:40px;" class="bankSymbol">Sell at</div>'+
						'<div style="display:inline-block;width:calc(100% - 46px)"><input type="number" id="sellAtInput-'+me.id+'" min="0" value="'+TraderBot.sellAt[i]+'"/></div>'+
					'</div>'+
				'</div>'+
			'</div>';
		}
		str += '</div>'+
			'<div class="line"></div>';
		
		Game.Prompt(str, [['Apply','TraderBot.applyConfig();'],'Cancel'],0,'sectionMiddlePrompt');
	}

	TraderBot.applyConfig = function() {
		var newBuyAt = Array(M.goodsById.length);
		var newSellAt = Array(M.goodsById.length);
		for (var i = 0; i < M.goodsById.length; i++) {
			var me = M.goodsById[i];
			var val = l('buyAtInput-'+me.id).value.trim();
			if (val.length == 0) {
				val = '0';
			}
			var parsed = parseInt(val, 10);
			newBuyAt[i] = parsed;

			val = l('sellAtInput-'+me.id).value.trim();
			if (val.length == 0) {
				val = '0';
			}
			parsed = parseInt(val, 10);
			newSellAt[i] = parsed;
		}

		for (var i = 0; i < M.goodsById.length; i++) {
			TraderBot.buyAt[i] = newBuyAt[i];
			TraderBot.sellAt[i] = newSellAt[i];
		}
		
		Game.ClosePrompt();
	}
}

if (Game.Objects['Bank'].minigameLoaded) {
	TraderBot.launchMod();
	Game.registerMod("TraderBot", TraderBot);
} else {
	var minigameName = Game.Objects['Bank'].minigameName;
	alert('Your game does not have '+minigameName+' yet. TraderBot requires your game to have a '+minigameName+'. You can unlock '+minigameName+' by progressing further into the game.');
}
