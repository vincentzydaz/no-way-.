if not game:IsLoaded() then
    game.Loaded:Wait()
end

-- creds to @amazonek for remote beautifier
for _, v in getgc() do
    if type(v) == "function" and islclosure(v) and not isexecutorclosure(v) then
        local source = debug.info(v, "s")
        local function_name = debug.info(v, "n")
        local function_upvalues = getupvalues(v)
        if function_name == "GetHandler" and #function_upvalues >= 4 and typeof(function_upvalues[1]) == "table" then
            for i, v in function_upvalues[1].Event do
                if typeof(v.Remote) == "Instance" then
                    v.Remote.Name = v.Name
                end
            end
            for i, v in function_upvalues[1].Function do
                if typeof(v.Remote) == "Instance" then
                    v.Remote.Name = v.Name
                end
            end
        end
    end
end

print("fixed remotes")

local replicated_storage = game:GetService("ReplicatedStorage")
local virtual_user = game:GetService("VirtualUser")
local workspace = game:GetService("Workspace")
local players = game:GetService("Players")

local local_player = players.LocalPlayer

local reserved_egg = local_player:FindFirstChild("Reserve")
if not reserved_egg then
    return local_player:Kick("Reserve egg folder not found!")
end

local values = local_player:FindFirstChild("Values")
if not values then
    return local_player:Kick("Values folder not found!")
end

local main = workspace:FindFirstChild("Main")
if not main then
    return local_player:Kick("Main folder not found!")
end

local plot = nil
local plots = main:FindFirstChild("Plots")
if not plots then
    return local_player:Kick("Plots folder not found!")
end

if values:FindFirstChild("Plot") and plots:FindFirstChild(tostring(values.Plot.Value)) then
    plot = plots[tostring(values.Plot.Value)]
else
    return local_player:Kick("Plot not found!")
end

local eggs = plot:FindFirstChild("Eggs")
if not eggs then
    return local_player:Kick("Eggs folder not found!")
end

local items = plot:FindFirstChild("Items")
if not items then
    return local_player:Kick("Items folder not found!")
end

local assets = replicated_storage:FindFirstChild("Assets")
if not assets then
    return local_player:Kick("Assets folder not found!")
end

local lib = replicated_storage:FindFirstChild("Library")
if not lib then
    return local_player:Kick("Library folder not found!")
end

local configs = lib:FindFirstChild("Configs")
if not configs then
    return local_player:Kick("Configs folder not found!")
end

local egg_module = require(configs:FindFirstChild("Eggs"))
if not egg_module then
    return local_player:Kick("Eggs module not found!")
end

local mutation_module = require(configs:FindFirstChild("Mutations"))
if not mutation_module then
    return local_player:Kick("Mutations module not found!")
end

local boombox_module = require(configs:FindFirstChild("Boomboxes"))
if not boombox_module then
    return local_player:Kick("Boomboxes module not found!")
end

local mutation_names = {}
local boombox_names = {}
local selected_eggs = {}
local reserved_eggs = {}
local egg_names = {}

local selected_reserved_egg = ""
local selected_boombox = ""

local auto_claim_brainrots = false
local auto_buy_items = false 
local auto_sell_all = false
local auto_buy_eggs = false
local anti_afk = false

local auto_claim_brainrots_delay = 1
local auto_sell_all_delay = 1
local auto_buy_item_delay = 1
local auto_buy_eggs_delay = 1

for _, v in egg_module do
    for i, v2 in v do
        if i == "name" then
            table.insert(egg_names, v2)
        end
    end
end

for i, v in boombox_module do
    for i2, v2 in v do
        if i2 == "name" then
            table.insert(boombox_names, v2)
        end
    end
end

for v in mutation_module do
    table.insert(mutation_names, v)
end

function update_reserved_list()
    reserved_eggs = {}
    for _, v in reserved_egg:GetDescendants() do
        if v.Name == "ItemName" then
            local text = v.Text
            local mutation = v.Parent.Parent:GetAttribute("ForcedMutation")

            if mutation then
                text = text.." "..mutation
            end

            if not table.find(reserved_eggs, text) then
                table.insert(reserved_eggs, text)
            end
        end
    end
    return reserved_eggs
end

function get_tool()
    return local_player.Character:FindFirstChildOfClass("Tool")
end

function get_money()
    return local_player:FindFirstChild("leaderstats"):FindFirstChild("Money").Value
end

local anti_afk_connection = local_player.Idled:Connect(function()
    if anti_afk then
        virtual_user:CaptureController()
        virtual_user:ClickButton2(Vector2.new())
    end
end)

local repo = 'https://raw.githubusercontent.com/KINGHUB01/Gui/main/'

local library = loadstring(game:HttpGet(repo .. 'Gui%20Lib%20%5BLibrary%5D'))()
local theme_manager = loadstring(game:HttpGet(repo .. 'Gui%20Lib%20%5BThemeManager%5D'))()
local save_manager = loadstring(game:HttpGet(repo .. 'Gui%20Lib%20%5BSaveManager%5D'))()

local window = library:CreateWindow({
    Title = 'Vincent Hub | My Singing Brainrots | Made By Exiled - VincentSensei',
    Center = true,
    AutoShow = true,
    TabPadding = 8,
    MenuFadeTime = 0.2
})

local tabs = {
    main = window:AddTab("Main"),
    shop = window:AddTab("Shop"),
    Inventory = window:AddTab("Inventory"),
    misc = window:AddTab("Misc"),
    dupe = window:AddTab("Dupe"),
    ["ui settings"] = window:AddTab("UI Settings")
}

local item_group = tabs.main:AddLeftGroupbox("Item Settings")
local egg_group = tabs.main:AddRightGroupbox("Egg Settings")
local sell_group = tabs.Inventory:AddLeftGroupbox("Sell Settings")
local shop_group = tabs.shop:AddLeftGroupbox("Shop Settings")
local local_player_group = tabs.misc:AddLeftGroupbox("Local Player Settings")
local dupe_group = tabs.dupe:AddRightGroupbox("Dupe Settings")
local menu_group = tabs["ui settings"]:AddLeftGroupbox("Menu Settings")

item_group:AddDivider()

item_group:AddToggle('auto_claim_brainrots', {
    Text = 'Auto Claim Brainrots',
    Default = auto_claim_brainrots,
    Tooltip = 'Claims cash from brainrots automatically',

    Callback = function(value)
        auto_claim_brainrots = value
        if value then
            repeat
                for _, v in items:GetChildren() do
                    if v.Name:find("Item") then
                        replicated_storage:WaitForChild("Communication"):WaitForChild("Functions"):WaitForChild("CollectItem"):InvokeServer(v)
                    end
                end
                task.wait(auto_claim_brainrots_delay)
            until not auto_claim_brainrots
        end
    end
})

item_group:AddSlider('auto_claim_brainrots_delay', {
    Text = 'Auto Claim Delay (Seconds):',
    Default = auto_claim_brainrots_delay,
    Min = 0,
    Max = 60,
    Rounding = 0,
    Compact = false,

    Callback = function(value)
        auto_claim_brainrots_delay = value
    end
})

egg_group:AddDivider()

egg_group:AddLabel("Select a mutation before using this feature!", true)

egg_group:AddToggle('auto_buy_eggs', {
    Text = 'Auto Buy Eggs',
    Default = auto_buy_eggs,
    Tooltip = 'Auto buys selected eggs from the conveyor',

    Callback = function(value)
        auto_buy_eggs = value
        if value then
            repeat
                for _, v in eggs:GetDescendants() do
                    if v.Name == "ItemName" then
                        local egg_name = v.Text
                        local cost_text = tonumber((v.Parent:FindFirstChild("Cost") and v.Parent:FindFirstChild("Cost").Text:gsub("[$,]", "")) or "")
                        local money = get_money()

                        for v2 in selected_eggs do
                            if v2 == egg_name and cost_text <= money then
                                replicated_storage:WaitForChild("Communication"):WaitForChild("Events"):WaitForChild("BuyEgg"):FireServer(v.Parent.Parent)
                            end
                        end
                    end
                end
                task.wait(auto_buy_eggs_delay)
            until not auto_buy_eggs
        end
    end
})

egg_group:AddDropdown('selected_eggs', {
    Values = egg_names,
    Default = selected_eggs,
    Multi = true,

    Text = 'Select Egg:',
    Tooltip = 'Select eggs to auto buy',

    Callback = function(value)
        selected_eggs = value
    end
})

egg_group:AddSlider('auto_buy_eggs_delay', {
    Text = 'Auto Buy Delay (Seconds):',
    Default = auto_buy_eggs_delay,
    Min = 0,
    Max = 60,
    Rounding = 0,
    Compact = false,

    Callback = function(value)
        auto_buy_eggs_delay = value
    end
})

sell_group:AddDivider()

sell_group:AddToggle('auto_sell_all', {
    Text = 'Sell All',
    Default = auto_sell_all,
    Tooltip = 'Automatically sells everything in your inventory',

    Callback = function(value)
        auto_sell_all = value
        if value then
            repeat
                replicated_storage:WaitForChild("Communication"):WaitForChild("Functions"):WaitForChild("SellAll"):InvokeServer()
                task.wait(auto_sell_all_delay)
            until not auto_sell_all
        end
    end
})

sell_group:AddSlider('auto_sell_all_delay', {
    Text = 'Auto Sell Delay (Seconds):',
    Default = auto_sell_all_delay,
    Min = 0,
    Max = 60,
    Rounding = 1,
    Compact = false,

    Callback = function(Value)
        auto_sell_all_delay = Value
    end
})

shop_group:AddDivider()

shop_group:AddDropdown('selected_boombox', {
    Values = boombox_names,
    Default = selected_boombox,
    Multi = false,

    Text = 'Select A Boombox To Buy:',
    Tooltip = 'Buys selected boombox from dropdown when pressing button',

    Callback = function(Value)
        selected_boombox = Value
    end
})

shop_group:AddButton({
    Text = 'Buy Selected Boombox',
    Func = function()
        if selected_boombox == "" then
            return library:Notify("No Boombox Selected!")
        end
        for i, v in boombox_module do
            for i2, v2 in v do
                if i2 == "name" and v2 == selected_boombox then
                    replicated_storage:WaitForChild("Communication"):WaitForChild("Functions"):WaitForChild("BuyItem"):InvokeServer(i)
                    library:Notify("Bought "..selected_boombox.."!")
                end
            end
        end
    end,
    DoubleClick = false,
    Tooltip = 'Buys selected boombox from dropdown'
})

local_player_group:AddDivider()

local_player_group:AddToggle('anti_afk', {
    Text = 'Anti Afk',
    Default = anti_afk,
    Tooltip = 'Prevents you from being kicked for being AFK',
    Callback = function(value)
        anti_afk = value
    end
})

menu_group:AddButton('Unload', function()
    auto_claim_brainrots = false
    auto_buy_items = false
    auto_sell_all = false
    auto_buy_eggs = false
    anti_afk = false
    anti_afk_connection:Disconnect()
    library:Unload()
end)

dupe_group:AddDivider()

dupe_group:AddLabel("Step-by-Step Instructions:", true)
dupe_group:AddLabel("1. Use the on your main account if needed.", true)
dupe_group:AddLabel("2. Click “Start Dupe” to duplicate.", true)
dupe_group:AddLabel("3. Trade the item to your friend or alt.", true)
dupe_group:AddLabel("4. Leave your main account, then rejoin, Your main account will still have the item.", true)

dupe_group:AddButton({
    Text = 'Start Dupe',
    Func = function()
        for i,v in next, getgc(true) do
    if type(v) == "table" and rawget(v, "Remote") then
        if type(v.Remote) == "userdata" then
            v.Remote.Name = v.Name
        end
    end
end
task.wait(0.2)
local args = {
    [1] = {
        ["Plot"] = "\255",
        ["Lower Quality"] = false
    }
}

game:GetService("ReplicatedStorage"):WaitForChild("Communication"):WaitForChild("Events"):WaitForChild("SaveSettings"):FireServer(unpack(args))
        print("Dupe script triggered!")
    end,
    DoubleClick = false,
    Tooltip = 'Executes the dupe function once when clicked'
})

menu_group:AddLabel('Menu bind'):AddKeyPicker('MenuKeybind', { Default = 'End', NoUI = true, Text = 'Menu keybind' })
library.ToggleKeybind = Options.MenuKeybind
theme_manager:SetLibrary(library)
save_manager:SetLibrary(library)
save_manager:IgnoreThemeSettings()
save_manager:SetIgnoreIndexes({ 'MenuKeybind' })
theme_manager:SetFolder('Aiyoku')
save_manager:SetFolder('Aiyoku/My Singing Brainrots000')
save_manager:BuildConfigSection(tabs['ui settings'])
theme_manager:ApplyToTab(tabs['ui settings'])
save_manager:LoadAutoloadConfig()
