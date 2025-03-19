#!/usr/bin/env node

/**
 * This script fetches contributor data from GitHub and updates the README.md file
 * with a contributors section showing avatars and usernames.
 * It also updates all localized README files in the locales directory.
 */

const https = require("https")
const fs = require("fs")
const path = require("path")

// GitHub API URL for fetching contributors
const GITHUB_API_URL = "https://api.github.com/repos/RooVetGit/Magic-Code/contributors?per_page=100"
const README_PATH = path.join(__dirname, "..", "README.md")
const LOCALES_DIR = path.join(__dirname, "..", "locales")

// Sentinel markers for contributors section
const START_MARKER = "<!-- START CONTRIBUTORS SECTION - AUTO-GENERATED, DO NOT EDIT MANUALLY -->"
const END_MARKER = "<!-- END CONTRIBUTORS SECTION -->"

// HTTP options for GitHub API request
const options = {
	headers: {
		"User-Agent": "Magic-Code-Contributors-Script",
	},
}

// Add GitHub token for authentication if available
if (process.env.GITHUB_TOKEN) {
	options.headers.Authorization = `token ${process.env.GITHUB_TOKEN}`
	console.log("Using GitHub token from environment variable")
}

/**
 * Fetches contributors data from GitHub API
 * @returns {Promise<Array>} Array of contributor objects
 */
function fetchContributors() {
	return new Promise((resolve, reject) => {
		https
			.get(GITHUB_API_URL, options, (res) => {
				if (res.statusCode !== 200) {
					reject(new Error(`GitHub API request failed with status code: ${res.statusCode}`))
					return
				}

				let data = ""
				res.on("data", (chunk) => {
					data += chunk
				})

				res.on("end", () => {
					try {
						const contributors = JSON.parse(data)
						resolve(contributors)
					} catch (error) {
						reject(new Error(`Failed to parse GitHub API response: ${error.message}`))
					}
				})
			})
			.on("error", (error) => {
				reject(new Error(`GitHub API request failed: ${error.message}`))
			})
	})
}

/**
 * Reads the README.md file
 * @returns {Promise<string>} README content
 */
function readReadme() {
	return new Promise((resolve, reject) => {
		fs.readFile(README_PATH, "utf8", (err, data) => {
			if (err) {
				reject(new Error(`Failed to read README.md: ${err.message}`))
				return
			}
			resolve(data)
		})
	})
}

/**
 * Creates HTML for the contributors section
 * @param {Array} contributors Array of contributor objects from GitHub API
 * @returns {string} HTML for contributors section
 */
function formatContributorsSection(contributors) {
	// Filter out GitHub Actions bot
	const filteredContributors = contributors.filter((c) => !c.login.includes("[bot]") && !c.login.includes("R00-B0T"))

	// Start building with Markdown table format
	let markdown = `${START_MARKER}
`
	// Number of columns in the table
	const COLUMNS = 6

	// Create contributor cell HTML
	const createCell = (contributor) => {
		return `<a href="${contributor.html_url}"><img src="${contributor.avatar_url}" width="100" height="100" alt="${contributor.login}"/><br /><sub><b>${contributor.login}</b></sub></a>`
	}

	if (filteredContributors.length > 0) {
		// Table header is the first row of contributors
		const headerCells = filteredContributors.slice(0, COLUMNS).map(createCell)

		// Fill any empty cells in header row
		while (headerCells.length < COLUMNS) {
			headerCells.push(" ")
		}

		// Add header row
		markdown += `|${headerCells.join("|")}|\n`

		// Add alignment row
		markdown += "|"
		for (let i = 0; i < COLUMNS; i++) {
			markdown += ":---:|"
		}
		markdown += "\n"

		// Add remaining contributor rows starting with the second batch
		for (let i = COLUMNS; i < filteredContributors.length; i += COLUMNS) {
			const rowContributors = filteredContributors.slice(i, i + COLUMNS)

			// Create cells for each contributor in this row
			const cells = rowContributors.map(createCell)

			// Fill any empty cells to maintain table structure
			while (cells.length < COLUMNS) {
				cells.push(" ")
			}

			// Add row to the table
			markdown += `|${cells.join("|")}|\n`
		}
	}

	markdown += `${END_MARKER}`
	return markdown
}

/**
 * Updates the README.md file with contributors section
 * @param {string} readmeContent Original README content
 * @param {string} contributorsSection HTML for contributors section
 * @returns {Promise<void>}
 */
function updateReadme(readmeContent, contributorsSection) {
	// Find existing contributors section markers
	const startPos = readmeContent.indexOf(START_MARKER)
	const endPos = readmeContent.indexOf(END_MARKER)

	if (startPos === -1 || endPos === -1) {
		console.warn("Warning: Could not find contributors section markers in README.md")
		console.warn("Skipping update - please add markers to enable automatic updates.")
		return
	}

	// Replace existing section, trimming whitespace at section boundaries
	const beforeSection = readmeContent.substring(0, startPos).trimEnd()
	const afterSection = readmeContent.substring(endPos + END_MARKER.length).trimStart()
	// Ensure single newline separators between sections
	const updatedContent = beforeSection + "\n\n" + contributorsSection.trim() + "\n\n" + afterSection

	return writeReadme(updatedContent)
}

/**
 * Writes updated content to README.md
 * @param {string} content Updated README content
 * @returns {Promise<void>}
 */
function writeReadme(content) {
	return new Promise((resolve, reject) => {
		fs.writeFile(README_PATH, content, "utf8", (err) => {
			if (err) {
				reject(new Error(`Failed to write updated README.md: ${err.message}`))
				return
			}
			resolve()
		})
	})
}
/**
 * Finds all localized README files in the locales directory
 * @returns {Promise<string[]>} Array of README file paths
 */
function findLocalizedReadmes() {
	return new Promise((resolve) => {
		const readmeFiles = []

		// Check if locales directory exists
		if (!fs.existsSync(LOCALES_DIR)) {
			// No localized READMEs found
			return resolve(readmeFiles)
		}

		// Get all language subdirectories
		const languageDirs = fs
			.readdirSync(LOCALES_DIR, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name)

		// Add all localized READMEs to the list
		for (const langDir of languageDirs) {
			const readmePath = path.join(LOCALES_DIR, langDir, "README.md")
			if (fs.existsSync(readmePath)) {
				readmeFiles.push(readmePath)
			}
		}

		resolve(readmeFiles)
	})
}

/**
 * Updates a localized README file with contributors section
 * @param {string} filePath Path to the README file
 * @param {string} contributorsSection HTML for contributors section
 * @returns {Promise<void>}
 */
function updateLocalizedReadme(filePath, contributorsSection) {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, "utf8", (err, readmeContent) => {
			if (err) {
				console.warn(`Warning: Could not read ${filePath}: ${err.message}`)
				return resolve()
			}

			// Find existing contributors section markers
			const startPos = readmeContent.indexOf(START_MARKER)
			const endPos = readmeContent.indexOf(END_MARKER)

			if (startPos === -1 || endPos === -1) {
				console.warn(`Warning: Could not find contributors section markers in ${filePath}`)
				console.warn(`Skipping update for ${filePath}`)
				return resolve()
			}

			// Replace existing section, trimming whitespace at section boundaries
			const beforeSection = readmeContent.substring(0, startPos).trimEnd()
			const afterSection = readmeContent.substring(endPos + END_MARKER.length).trimStart()
			// Ensure single newline separators between sections
			const updatedContent = beforeSection + "\n\n" + contributorsSection.trim() + "\n\n" + afterSection

			fs.writeFile(filePath, updatedContent, "utf8", (writeErr) => {
				if (writeErr) {
					console.warn(`Warning: Failed to update ${filePath}: ${writeErr.message}`)
					return resolve()
				}
				console.log(`Updated ${filePath}`)
				resolve()
			})
		})
	})
}

/**
 * Main function that orchestrates the update process
 */
async function main() {
	try {
		// Fetch contributors from GitHub
		const contributors = await fetchContributors()
		console.log(`Fetched ${contributors.length} contributors from GitHub`)

		// Generate contributors section
		const contributorsSection = formatContributorsSection(contributors)

		// Update main README
		const readmeContent = await readReadme()
		await updateReadme(readmeContent, contributorsSection)
		console.log(`Updated ${README_PATH}`)

		// Find and update all localized README files
		const localizedReadmes = await findLocalizedReadmes()
		console.log(`Found ${localizedReadmes.length} localized README files`)

		// Update each localized README
		for (const readmePath of localizedReadmes) {
			await updateLocalizedReadme(readmePath, contributorsSection)
		}

		console.log("Contributors section update complete")
	} catch (error) {
		console.error(`Error: ${error.message}`)
		process.exit(1)
	}
}

// Run the script
main()
