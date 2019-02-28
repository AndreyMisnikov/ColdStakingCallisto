window.Explorer2 = new function () {
	this.smartContractAddress = "0xd813419749b3c2cdc94a2f9cfcf154113264a9d6";
	this.indexTransactionTo = 3;
	this.indexTx = 0;
	this.inputDataToStartStaking = "0x1f288efb";
	this.rounds = [];

	this.checkWalletCS = function (wallet) {
		this.rounds = [];
		//wallet = "0xf4663ed2f13d23c50cbda76af62172eddf2c0c93";

		var data = { "addr": wallet };
		var that = this;
		$.ajax({
			method: 'POST',
			url: 'https://explorer2.callisto.network/addr',
			data
		}).then(function(resp) {
			var response = JSON.parse(resp);

			if (!response || !response.data || response.data.length === 0) {
				alert("No info about CS");
				return;
			}

			var transactions = response.data;
			that.findCSTransaction(transactions);
		});
	};

	this.findCSTransaction = function (transactions) {
		if (!transactions || transactions.length === 0) {
			this.printRoundsInfo();
			return;
		}

		var transaction = transactions.shift();

		if (transaction[this.indexTransactionTo] === this.smartContractAddress) {
			var tx = transaction[this.indexTx];
			this.checkTransactionOnStartStacking(tx, transactions);
		} else {
			this.findCSTransaction(transactions);
		}
	};

	this.checkTransactionOnStartStacking = function(tx, transactions) {
		var data = { "tx": tx };
		var that = this;
		$.ajax({
			method: 'POST',
			url: 'https://explorer2.callisto.network/web3relay',
			data
		}).then(function(resp) {
			var response = JSON.parse(resp);
			if (response.input === that.inputDataToStartStaking) {
				that.funcOnStartCS(response);
			}
			that.findCSTransaction(transactions);
		});
	};

	this.funcOnStartCS = function(response) {
		var txDate = response.timestamp;
		var txDateTime = new Date(1000 * txDate);

		var round = {};
		round.StartDate = txDateTime;
		round.EndDate = new Date(round.StartDate.setDate(round.StartDate.getDate() + 27));

		this.rounds.push(round);
	};

	this.printRoundsInfo = function() {
		$(this.rounds).each(function(index, round) {
			var roundMessage = "Cold Staking Roung was started " + round.StartDate;
			var secondPart = "";

			if (round.EndDate > new Date()) {
				secondPart = " and will be finished ";
			} else {
				secondPart = " and was finished ";
			}
			roundMessage += secondPart + round.EndDate;
			console.log(roundMessage);
		});
	};
};