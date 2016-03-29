var 
	path = require('path'),
	fs = require('fs');

var Authz = function(opts) {
	this.allowedUsers = [];
	this.allowedGroups = [];
};

Authz.prototype.allowUsers = function(users) {
	this.allowedUsers = this.allowedUsers.concat(users);
	return this;
}
Authz.prototype.allowGroups = function(groups) {
	this.allowedGroups = this.allowedGroups.concat(groups);
	return this;
}

Authz.prototype.isUserAllowed = function(userid) {
	for(var i = 0; i < this.allowedUsers.length; i++) {
		// console.log(" ] Checking user [" + userid + "] against allowed user [" + this.allowedUsers[i] + "]")
		if (this.allowedUsers[i] === userid) {
			return true;
		}
	}
	return false;
}

Authz.prototype.isGroupAllowed = function(groupid) {
	for(var i = 0; i < this.allowedGroups.length; i++) {
		// console.log(" ] Checking group [" + groupid + "] against allowed group [" + this.allowedGroups[i] + "]")
		if (this.allowedGroups[i] === groupid) {
			return true;
		}
	}
	return false;
}

Authz.prototype.isAnyGroupsAllowed = function(groups) {
	for(var i = 0; i < groups.length; i++) {
		if (this.isGroupAllowed(groups[i].id)) {
			return true;
		}
	}
	return false;
}


Authz.prototype.exec = function(req, res, next) {

	if (req.user) {
		if (this.isUserAllowed(req.user.data.id)) {
			return next();
		}
		if (this.isAnyGroupsAllowed(req.user.groups)) {
			return next();
		}
	}
	var filename = path.join(__dirname, "../../templates/", "401.html");
	var file = fs.readFileSync(filename, "utf-8");
	res.status(401).send(file);
}

Authz.prototype.middleware = function() {
	// return function(req, res) {
	// 	this.exec(req, res);	
	// }.bind(this);
	return this.exec.bind(this);
};


exports.Authz = Authz;