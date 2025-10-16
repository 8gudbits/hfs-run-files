exports.repo = "8gudbits/hfs-run"
exports.version = 1.0
exports.description = "Run executable files on the server (Windows only) using hfs."
exports.apiRequired = 9.6
exports.frontend_js = ["main.js"]
exports.frontend_css = ["style.css"]

exports.init = (api) => {
  const { execFile } = api.require("child_process")
  const path = api.require("path")
  const fs = api.require("fs")

  exports.customRest = {
    runFile({ file }) {
      if (!file) {
        return { success: false, error: "No file specified" }
      }

      const safeFile = path.basename(file)
      const hfsRoot = process.cwd()
      const fullPath = path.join(hfsRoot, safeFile)

      if (!fs.existsSync(fullPath)) {
        return { success: false, error: "File not found: " + fullPath }
      }

      if (!fullPath.startsWith(hfsRoot)) {
        return { success: false, error: "Invalid file path" }
      }

      const ext = path.extname(fullPath).toLowerCase().slice(1)

      let command
      let args = []

      switch (ext) {
        case "ps1":
          command = "powershell.exe"
          args = ["-ExecutionPolicy", "Bypass", "-File", fullPath]
          break
        case "msi":
          command = "msiexec"
          args = ["/i", fullPath]
          break
        default:
          command = "cmd.exe"
          args = ["/c", fullPath]
          break
      }

      execFile(command, args, { cwd: path.dirname(fullPath) }, (error) => {
        if (error) {
          api.log("Error running file: " + error.message)
        } else {
          api.log("File executed successfully: " + file)
        }
      })

      return { success: true, message: "File execution started: " + file }
    },
  }
}

exports.config = {
  showRunButton: {
    frontend: true,
    type: "boolean",
    defaultValue: true,
    label: "Show run button for executable files",
  },
  fileExtensions: {
    frontend: true,
    type: "string",
    defaultValue: "exe|msi|bat|ps1|vbs",
    label: "File extensions to show run button for",
    description:
      "Separate extensions with | (pipe) character. Example: exe|bat|ps1|vbs",
  },
}

