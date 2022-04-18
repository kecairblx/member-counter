import fetch from "node-fetch";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./config.json"));

let members;

async function sendEmbed(...args) {
	const { botToken, channelId, embed: { template, color } } = config;

	try {
		await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
			method: "POST",
			body: JSON.stringify({
				embeds: [
					{
						description: template.format(...args),
						color: color
					}
				]
			}),
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bot ${botToken}`
			}
		});
	} catch (error) {
		console.info(error);
	}
}

setInterval(async () => {
	const response = await fetch(`https://groups.roblox.com/v1/groups/${config.groupId}`);
	if (response.status != 200) return;

	const { memberCount } = await response.json();

	if (memberCount !== members) {
		const step = Math.ceil(members / 5000) * 5000;
		const goal = Math.ceil(memberCount / 50000) * 50000;

		if (members > 0 && memberCount >= step) {
			await sendEmbed(
				step.toLocaleString("en-US"),
				(goal-step).toLocaleString("en-US"),
				goal.toLocaleString("en-US")
			);
		}

		await sendEmbed(
			memberCount.toLocaleString("en-US"),
			(goal-memberCount).toLocaleString("en-US"),
			goal.toLocaleString("en-US")
		);
	}

	members = memberCount
}, config.intervals.message);

String.prototype.format = function(...args) {
	var args = [...args];
	return this.replace(/{(\d+)}/g, (match, num) => {
		return typeof args[num] != "undefined" ? args[num] : match;
	});
};