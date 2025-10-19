exports.repo = "8gudbits/hfs-run"
exports.version = 1.3
exports.description = "Run executable files on the server (Windows only) using hfs."
exports.apiRequired = 9.6
exports.frontend_js = ["main.js"]
exports.frontend_css = ["style.css"]
exports.changelog = [
    { "version": 1.3, "message": "Fixed CLI app interference with HFS by using proper process detachment" },
    { "version": 1.2, "message": "Added user/group permissions - admin can now restrict run button visibility to specific users or groups" },
    { "version": 1.1, "message": "Fixed file path resolution issue - now properly maps VFS files to real file system paths" },
    { "version": 1.0, "message": "Initial release with basic file execution functionality and configurable file extensions" }
]

exports.init = (api) => {
  const { spawn } = api.require("child_process")
  const path = api.require("path")
  const fs = api.require("fs")

  const filePathMap = new Map()

  exports.onDirEntry = ({ node }) => {
    if (node && node.source && node.name) {
      filePathMap.set(node.name, node.source)
    }
  }

  exports.customRest = {
    runFile({ file }) {
      if (!file) {
        return { success: false, error: "No file specified" }
      }

      const fullPath = filePathMap.get(file)

      if (!fullPath) {
        return {
          success: false,
          error: `File "${file}" not found. Please refresh the file list and try again.`,
        }
      }

      if (!fs.existsSync(fullPath)) {
        return { success: false, error: "File not found on disk: " + fullPath }
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

      const child = spawn(command, args, {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      })

      child.unref()

      child.on("error", (error) => {
        api.log("Error running file: " + error.message)
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
  allowedUsers: {
    frontend: true,
    type: "username",
    multiple: true,
    defaultValue: [],
    label: "Users/groups who can see run buttons",
    description:
      "Leave empty to show to all users. Select specific users or groups to restrict access.",
  },
}
