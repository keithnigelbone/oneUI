# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web-header-qa.spec.ts >> Functional >> [fn] avatar=true shows avatar
- Location: e2e/web-header-qa.spec.ts:169:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('web-header-avatar-true').locator('[data-oneui-component="Avatar"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('web-header-avatar-true').locator('[data-oneui-component="Avatar"]')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]: Brand source
        - generic [ref=e7]:
          - combobox "Brand source" [ref=e11] [cursor=pointer]:
            - generic:
              - generic:
                - textbox: Fixture (offline)
                - img [ref=e14]
          - generic [ref=e16]: Fixture (offline)
          - textbox [ref=e17]: fixture
      - generic [ref=e18]:
        - generic [ref=e19]: Brand
        - generic [ref=e21]: Fixture (offline)
      - generic [ref=e23]:
        - generic [ref=e24]: Platform
        - generic [ref=e25]:
          - combobox "Platform" [ref=e29] [cursor=pointer]:
            - generic:
              - generic:
                - textbox: Web
                - img [ref=e32]
          - generic [ref=e34]: Web
          - textbox [ref=e35]: web
      - generic [ref=e37]:
        - generic [ref=e38]: Viewport
        - generic [ref=e39]:
          - combobox "Viewport breakpoint" [ref=e43] [cursor=pointer]:
            - generic:
              - generic:
                - textbox: Responsive
                - img [ref=e46]
          - generic [ref=e48]: Responsive
          - textbox [ref=e49]: responsive
      - generic [ref=e51]:
        - generic [ref=e52]: Density
        - generic [ref=e53]:
          - combobox "Density" [ref=e57] [cursor=pointer]:
            - generic:
              - generic:
                - textbox: Default
                - img [ref=e60]
          - generic [ref=e62]: Default
          - textbox [ref=e63]: default
  - generic [ref=e66]:
    - generic [ref=e67]:
      - banner [ref=e68]:
        - button "Components" [ref=e69] [cursor=pointer]:
          - img [ref=e72]
          - generic [ref=e74]: Components
        - generic [ref=e75]:
          - generic [ref=e76]:
            - heading "Web Header" [level=1] [ref=e77]
            - status "Unstable — has failed Playwright tests" [ref=e78]:
              - generic [ref=e79]: Unstable
          - generic [ref=e80]:
            - 'status "Component slug: web-header" [ref=e81]':
              - generic [ref=e82]: web-header
            - 'status "Category: Navigation" [ref=e83]':
              - generic [ref=e84]: Navigation
          - generic [ref=e85]: Responsive web navigation header with primary nav bar, secondary nav tabs, mobile drawer, search, and scroll-based show/hide.
        - separator [ref=e86]
        - region "Test report" [ref=e88]:
          - generic [ref=e89]: View the latest accessibility and functional results for Web Header. Use the tabs below for full breakdowns. In dev, Run tests executes Playwright here with live output.
          - generic [ref=e90]:
            - button "Run tests" [ref=e91] [cursor=pointer]:
              - generic [ref=e92]: Run tests
            - button "Load Playwright report" [ref=e93] [cursor=pointer]:
              - generic [ref=e94]: Load Playwright report
          - status "Report loaded with test failures" [ref=e95]:
            - img [ref=e98]
            - generic [ref=e100]: Report loaded with failures. Review Accessibility and Functional Tests for details.
          - generic [ref=e101]:
            - status "Report fetched time" [ref=e102]:
              - generic [ref=e103]: Fetched 09-Jul-26 8:09 PM (just now)
            - status "Test run time" [ref=e104]:
              - generic [ref=e105]: Test run 09-Jul-26 7:54 PM (14 mins ago)
        - separator [ref=e106]
        - button "Report data source" [ref=e108] [cursor=pointer]:
          - img [ref=e109]
          - generic [ref=e111]: Report data source
      - tablist [ref=e114]:
        - tab "Test Scenarios" [active] [selected] [ref=e115] [cursor=pointer]:
          - generic [ref=e117]:
            - img [ref=e120]
            - generic [ref=e122]: Test Scenarios
        - tab "Figma Validation" [ref=e123] [cursor=pointer]:
          - generic [ref=e125]:
            - img [ref=e128]
            - generic [ref=e130]: Figma Validation
        - tab "Accessibility" [ref=e131] [cursor=pointer]:
          - generic [ref=e133]:
            - img [ref=e136]
            - generic [ref=e138]: Accessibility
        - tab "Functional Tests" [ref=e139] [cursor=pointer]:
          - generic [ref=e141]:
            - img [ref=e144]
            - generic [ref=e146]: Functional Tests
    - tabpanel [ref=e147]:
      - generic [ref=e148]:
        - region "Default (homeBar · fluid · search end)" [ref=e149]:
          - heading "Default (homeBar · fluid · search end)" [level=3] [ref=e150]
          - generic [ref=e151]:
            - paragraph [ref=e152]:
              - text: Default configuration —
              - code [ref=e153]: type=homeBar
              - text: ","
              - code [ref=e154]: middle=fluid
              - text: ","
              - code [ref=e155]: searchInput=end
              - text: ", four nav items, IconButton end actions + avatar."
            - navigation "Default — primary navigation" [ref=e160]:
              - generic:
                - separator
              - img "Brand" [ref=e162]:
                - img [ref=e164]:
                  - generic [ref=e165]: B
              - generic [ref=e166]:
                - button "Home" [ref=e167] [cursor=pointer]:
                  - generic [ref=e170]: Home
                - button "Products" [ref=e171] [cursor=pointer]:
                  - generic [ref=e174]: Products
                - button "Solutions" [ref=e175] [cursor=pointer]:
                  - generic [ref=e178]: Solutions
                - button "Resources" [ref=e179] [cursor=pointer]:
                  - generic [ref=e182]: Resources
              - generic [ref=e183]:
                - search "Default — site search" [ref=e184]:
                  - generic [ref=e186]:
                    - img [ref=e189]
                    - searchbox "Search" [ref=e191]
                - generic [ref=e192]:
                  - button "Ask HelloJio" [ref=e193] [cursor=pointer]:
                    - img [ref=e196]
                  - button "Notifications" [ref=e198] [cursor=pointer]:
                    - img [ref=e200]
                - img "Jane Doe" [ref=e202]:
                  - img [ref=e204]
        - region "homeBar (Figma type=homeBar)" [ref=e206]:
          - heading "homeBar (Figma type=homeBar)" [level=3] [ref=e207]
          - generic [ref=e208]:
            - paragraph [ref=e209]:
              - text: HomeBar matrix —
              - code [ref=e210]: middle
              - text: ×
              - code [ref=e211]: searchInput
              - text: combinations from Figma.
            - generic [ref=e213]:
              - generic [ref=e214]:
                - paragraph [ref=e215]: Fluid + Search End
                - navigation "Fluid + Search End — primary navigation" [ref=e219]:
                  - generic:
                    - separator
                  - img "Brand" [ref=e221]:
                    - img [ref=e223]:
                      - generic [ref=e224]: B
                  - generic [ref=e225]:
                    - button "Home" [ref=e226] [cursor=pointer]:
                      - generic [ref=e229]: Home
                    - button "Products" [ref=e230] [cursor=pointer]:
                      - generic [ref=e233]: Products
                    - button "Solutions" [ref=e234] [cursor=pointer]:
                      - generic [ref=e237]: Solutions
                    - button "Resources" [ref=e238] [cursor=pointer]:
                      - generic [ref=e241]: Resources
                  - generic [ref=e242]:
                    - search "Fluid + Search End — site search" [ref=e243]:
                      - generic [ref=e245]:
                        - img [ref=e248]
                        - searchbox "Search" [ref=e250]
                    - generic [ref=e251]:
                      - button "Ask HelloJio" [ref=e252] [cursor=pointer]:
                        - img [ref=e255]
                      - button "Notifications" [ref=e257] [cursor=pointer]:
                        - img [ref=e259]
                    - img "Jane Doe" [ref=e261]:
                      - img [ref=e263]
              - generic [ref=e265]:
                - paragraph [ref=e266]: Fluid + Search Middle
                - navigation "Fluid + Search Middle — primary navigation" [ref=e270]:
                  - generic:
                    - separator
                  - img "Brand" [ref=e272]:
                    - img [ref=e274]:
                      - generic [ref=e275]: B
                  - generic [ref=e276]:
                    - button "Home" [ref=e277] [cursor=pointer]:
                      - generic [ref=e280]: Home
                    - button "Products" [ref=e281] [cursor=pointer]:
                      - generic [ref=e284]: Products
                    - button "Solutions" [ref=e285] [cursor=pointer]:
                      - generic [ref=e288]: Solutions
                    - button "Resources" [ref=e289] [cursor=pointer]:
                      - generic [ref=e292]: Resources
                    - search "Fluid + Search Middle — site search" [ref=e293]:
                      - generic [ref=e295]:
                        - img [ref=e298]
                        - searchbox "Search" [ref=e300]
                  - generic [ref=e301]:
                    - generic [ref=e302]:
                      - button "Ask HelloJio" [ref=e303] [cursor=pointer]:
                        - img [ref=e306]
                      - button "Notifications" [ref=e308] [cursor=pointer]:
                        - img [ref=e310]
                    - img "Jane Doe" [ref=e312]:
                      - img [ref=e314]
              - generic [ref=e316]:
                - paragraph [ref=e317]: Centred + No Search
                - navigation "Centred + No Search — primary navigation" [ref=e321]:
                  - generic:
                    - separator
                  - img "Brand" [ref=e323]:
                    - img [ref=e325]:
                      - generic [ref=e326]: B
                  - generic [ref=e327]:
                    - button "Home" [ref=e328] [cursor=pointer]:
                      - generic [ref=e331]: Home
                    - button "Products" [ref=e332] [cursor=pointer]:
                      - generic [ref=e335]: Products
                    - button "Solutions" [ref=e336] [cursor=pointer]:
                      - generic [ref=e339]: Solutions
                    - button "Resources" [ref=e340] [cursor=pointer]:
                      - generic [ref=e343]: Resources
                  - generic [ref=e344]:
                    - generic [ref=e345]:
                      - button "Ask HelloJio" [ref=e346] [cursor=pointer]:
                        - img [ref=e349]
                      - button "Notifications" [ref=e351] [cursor=pointer]:
                        - img [ref=e353]
                    - img "Jane Doe" [ref=e355]:
                      - img [ref=e357]
              - generic [ref=e359]:
                - paragraph [ref=e360]: No Hamburger
                - navigation "No Hamburger — primary navigation" [ref=e364]:
                  - generic:
                    - separator
                  - img "Brand" [ref=e366]:
                    - img [ref=e368]:
                      - generic [ref=e369]: B
                  - generic [ref=e370]:
                    - button "Home" [ref=e371] [cursor=pointer]:
                      - generic [ref=e374]: Home
                    - button "Products" [ref=e375] [cursor=pointer]:
                      - generic [ref=e378]: Products
                    - button "Solutions" [ref=e379] [cursor=pointer]:
                      - generic [ref=e382]: Solutions
                  - generic [ref=e383]:
                    - search "No Hamburger — site search" [ref=e384]:
                      - generic [ref=e386]:
                        - img [ref=e389]
                        - searchbox "Search" [ref=e391]
                    - generic [ref=e392]:
                      - button "Ask HelloJio" [ref=e393] [cursor=pointer]:
                        - img [ref=e396]
                      - button "Notifications" [ref=e398] [cursor=pointer]:
                        - img [ref=e400]
                    - img "Jane Doe" [ref=e402]:
                      - img [ref=e404]
        - region "contextBar (Figma type=contextBar)" [ref=e406]:
          - heading "contextBar (Figma type=contextBar)" [level=3] [ref=e407]
          - generic [ref=e410]:
            - generic [ref=e411]:
              - paragraph [ref=e412]: primaryNavItems=false
              - navigation "ContextBar without nav items" [ref=e416]:
                - generic:
                  - separator
                - img "Brand" [ref=e418]:
                  - img [ref=e420]:
                    - generic [ref=e421]: B
                - generic [ref=e422]:
                  - generic [ref=e423]:
                    - button "Ask HelloJio" [ref=e424] [cursor=pointer]:
                      - img [ref=e427]
                    - button "Notifications" [ref=e429] [cursor=pointer]:
                      - img [ref=e431]
                  - img "Jane Doe" [ref=e433]:
                    - img [ref=e435]
            - generic [ref=e437]:
              - paragraph [ref=e438]: primaryNavItems=true
              - navigation "ContextBar with nav items" [ref=e442]:
                - generic:
                  - separator
                - img "Brand" [ref=e444]:
                  - img [ref=e446]:
                    - generic [ref=e447]: B
                - generic [ref=e448]:
                  - button "Home" [ref=e449] [cursor=pointer]:
                    - generic [ref=e452]: Home
                  - button "About" [ref=e453] [cursor=pointer]:
                    - generic [ref=e456]: About
                - generic [ref=e457]:
                  - generic [ref=e458]:
                    - button "Ask HelloJio" [ref=e459] [cursor=pointer]:
                      - img [ref=e462]
                    - button "Notifications" [ref=e464] [cursor=pointer]:
                      - img [ref=e466]
                  - img "Jane Doe" [ref=e468]:
                    - img [ref=e470]
        - region "searchBar (Figma type=searchBar)" [ref=e472]:
          - heading "searchBar (Figma type=searchBar)" [level=3] [ref=e473]
          - generic [ref=e476]:
            - generic [ref=e477]:
              - paragraph [ref=e478]: searchInput=middle
              - navigation "SearchBar middle search" [ref=e482]:
                - generic:
                  - separator
                - img "Brand" [ref=e484]:
                  - img [ref=e486]:
                    - generic [ref=e487]: B
                - search "SearchBar middle — site search" [ref=e489]:
                  - generic [ref=e491]:
                    - img [ref=e494]
                    - searchbox "Search" [ref=e496]
                - generic [ref=e497]:
                  - generic [ref=e498]:
                    - button "Ask HelloJio" [ref=e499] [cursor=pointer]:
                      - img [ref=e502]
                    - button "Notifications" [ref=e504] [cursor=pointer]:
                      - img [ref=e506]
                  - img "Jane Doe" [ref=e508]:
                    - img [ref=e510]
            - generic [ref=e512]:
              - paragraph [ref=e513]: searchInput=end
              - navigation "SearchBar end search" [ref=e517]:
                - generic:
                  - separator
                - img "Brand" [ref=e519]:
                  - img [ref=e521]:
                    - generic [ref=e522]: B
                - generic [ref=e523]:
                  - search "SearchBar end — site search" [ref=e524]:
                    - generic [ref=e526]:
                      - img [ref=e529]
                      - searchbox "Search" [ref=e531]
                  - generic [ref=e532]:
                    - button "Ask HelloJio" [ref=e533] [cursor=pointer]:
                      - img [ref=e536]
                    - button "Notifications" [ref=e538] [cursor=pointer]:
                      - img [ref=e540]
                  - img "Jane Doe" [ref=e542]:
                    - img [ref=e544]
        - region "start=true / start=false" [ref=e546]:
          - heading "start=true / start=false" [level=3] [ref=e547]
          - generic [ref=e550]:
            - generic [ref=e551]:
              - paragraph [ref=e552]: start=true (logo + menu on mobile)
              - navigation "Start slot visible" [ref=e556]:
                - generic:
                  - separator
                - img "Brand" [ref=e558]:
                  - img [ref=e560]:
                    - generic [ref=e561]: B
                - generic [ref=e562]:
                  - button "Home" [ref=e563] [cursor=pointer]:
                    - generic [ref=e566]: Home
                  - button "Products" [ref=e567] [cursor=pointer]:
                    - generic [ref=e570]: Products
                  - button "Solutions" [ref=e571] [cursor=pointer]:
                    - generic [ref=e574]: Solutions
                  - button "Resources" [ref=e575] [cursor=pointer]:
                    - generic [ref=e578]: Resources
                - generic [ref=e579]:
                  - search "Site search" [ref=e580]:
                    - generic [ref=e582]:
                      - img [ref=e585]
                      - searchbox "Search" [ref=e587]
                  - generic [ref=e588]:
                    - button "Ask HelloJio" [ref=e589] [cursor=pointer]:
                      - img [ref=e592]
                    - button "Notifications" [ref=e594] [cursor=pointer]:
                      - img [ref=e596]
                  - img "Jane Doe" [ref=e598]:
                    - img [ref=e600]
            - generic [ref=e602]:
              - paragraph [ref=e603]: start=false (no logo)
              - navigation "Start slot hidden" [ref=e607]:
                - generic:
                  - separator
                - generic [ref=e608]:
                  - button "Home" [ref=e609] [cursor=pointer]:
                    - generic [ref=e612]: Home
                  - button "Products" [ref=e613] [cursor=pointer]:
                    - generic [ref=e616]: Products
                  - button "Solutions" [ref=e617] [cursor=pointer]:
                    - generic [ref=e620]: Solutions
                  - button "Resources" [ref=e621] [cursor=pointer]:
                    - generic [ref=e624]: Resources
                - generic [ref=e625]:
                  - search "Site search" [ref=e626]:
                    - generic [ref=e628]:
                      - img [ref=e631]
                      - searchbox "Search" [ref=e633]
                  - generic [ref=e634]:
                    - button "Ask HelloJio" [ref=e635] [cursor=pointer]:
                      - img [ref=e638]
                    - button "Notifications" [ref=e640] [cursor=pointer]:
                      - img [ref=e642]
                  - img "Jane Doe" [ref=e644]:
                    - img [ref=e646]
        - region "middle=fluid / middle=centred" [ref=e648]:
          - heading "middle=fluid / middle=centred" [level=3] [ref=e649]
          - generic [ref=e652]:
            - generic [ref=e653]:
              - paragraph [ref=e654]: middle=fluid
              - navigation "Middle fluid layout" [ref=e658]:
                - generic:
                  - separator
                - img "Brand" [ref=e660]:
                  - img [ref=e662]:
                    - generic [ref=e663]: B
                - generic [ref=e664]:
                  - button "Home" [ref=e665] [cursor=pointer]:
                    - generic [ref=e668]: Home
                  - button "Products" [ref=e669] [cursor=pointer]:
                    - generic [ref=e672]: Products
                  - button "Solutions" [ref=e673] [cursor=pointer]:
                    - generic [ref=e676]: Solutions
                  - button "Resources" [ref=e677] [cursor=pointer]:
                    - generic [ref=e680]: Resources
                - generic [ref=e681]:
                  - search "Site search" [ref=e682]:
                    - generic [ref=e684]:
                      - img [ref=e687]
                      - searchbox "Search" [ref=e689]
                  - generic [ref=e690]:
                    - button "Ask HelloJio" [ref=e691] [cursor=pointer]:
                      - img [ref=e694]
                    - button "Notifications" [ref=e696] [cursor=pointer]:
                      - img [ref=e698]
                  - img "Jane Doe" [ref=e700]:
                    - img [ref=e702]
            - generic [ref=e704]:
              - paragraph [ref=e705]: middle=centred
              - navigation "Middle centred layout" [ref=e709]:
                - generic:
                  - separator
                - img "Brand" [ref=e711]:
                  - img [ref=e713]:
                    - generic [ref=e714]: B
                - generic [ref=e715]:
                  - button "Home" [ref=e716] [cursor=pointer]:
                    - generic [ref=e719]: Home
                  - button "Products" [ref=e720] [cursor=pointer]:
                    - generic [ref=e723]: Products
                  - button "Solutions" [ref=e724] [cursor=pointer]:
                    - generic [ref=e727]: Solutions
                  - button "Resources" [ref=e728] [cursor=pointer]:
                    - generic [ref=e731]: Resources
                - generic [ref=e732]:
                  - generic [ref=e733]:
                    - button "Ask HelloJio" [ref=e734] [cursor=pointer]:
                      - img [ref=e737]
                    - button "Notifications" [ref=e739] [cursor=pointer]:
                      - img [ref=e741]
                  - img "Jane Doe" [ref=e743]:
                    - img [ref=e745]
        - region "primaryNavItems=true / false" [ref=e747]:
          - heading "primaryNavItems=true / false" [level=3] [ref=e748]
          - generic [ref=e751]:
            - generic [ref=e752]:
              - paragraph [ref=e753]: primaryNavItems=true
              - navigation "Primary nav items visible" [ref=e757]:
                - generic:
                  - separator
                - img "Brand" [ref=e759]:
                  - img [ref=e761]:
                    - generic [ref=e762]: B
                - generic [ref=e763]:
                  - button "Home" [ref=e764] [cursor=pointer]:
                    - generic [ref=e767]: Home
                  - button "Products" [ref=e768] [cursor=pointer]:
                    - generic [ref=e771]: Products
                  - button "Solutions" [ref=e772] [cursor=pointer]:
                    - generic [ref=e775]: Solutions
                  - button "Resources" [ref=e776] [cursor=pointer]:
                    - generic [ref=e779]: Resources
                - generic [ref=e780]:
                  - search "Site search" [ref=e781]:
                    - generic [ref=e783]:
                      - img [ref=e786]
                      - searchbox "Search" [ref=e788]
                  - generic [ref=e789]:
                    - button "Ask HelloJio" [ref=e790] [cursor=pointer]:
                      - img [ref=e793]
                    - button "Notifications" [ref=e795] [cursor=pointer]:
                      - img [ref=e797]
                  - img "Jane Doe" [ref=e799]:
                    - img [ref=e801]
            - generic [ref=e803]:
              - paragraph [ref=e804]: primaryNavItems=false
              - navigation "Primary nav items hidden" [ref=e808]:
                - generic:
                  - separator
                - img "Brand" [ref=e810]:
                  - img [ref=e812]:
                    - generic [ref=e813]: B
                - generic [ref=e814]:
                  - generic [ref=e815]:
                    - button "Ask HelloJio" [ref=e816] [cursor=pointer]:
                      - img [ref=e819]
                    - button "Notifications" [ref=e821] [cursor=pointer]:
                      - img [ref=e823]
                  - img "Jane Doe" [ref=e825]:
                    - img [ref=e827]
        - region "end=true / end=false" [ref=e829]:
          - heading "end=true / end=false" [level=3] [ref=e830]
          - generic [ref=e833]:
            - generic [ref=e834]:
              - paragraph [ref=e835]: end=true (IconButton actions)
              - navigation "End actions visible" [ref=e839]:
                - generic:
                  - separator
                - img "Brand" [ref=e841]:
                  - img [ref=e843]:
                    - generic [ref=e844]: B
                - generic [ref=e845]:
                  - button "Home" [ref=e846] [cursor=pointer]:
                    - generic [ref=e849]: Home
                  - button "Products" [ref=e850] [cursor=pointer]:
                    - generic [ref=e853]: Products
                  - button "Solutions" [ref=e854] [cursor=pointer]:
                    - generic [ref=e857]: Solutions
                  - button "Resources" [ref=e858] [cursor=pointer]:
                    - generic [ref=e861]: Resources
                - generic [ref=e862]:
                  - search "Site search" [ref=e863]:
                    - generic [ref=e865]:
                      - img [ref=e868]
                      - searchbox "Search" [ref=e870]
                  - generic [ref=e871]:
                    - button "Ask HelloJio" [ref=e872] [cursor=pointer]:
                      - img [ref=e875]
                    - button "Notifications" [ref=e877] [cursor=pointer]:
                      - img [ref=e879]
                  - img "Jane Doe" [ref=e881]:
                    - img [ref=e883]
            - generic [ref=e885]:
              - paragraph [ref=e886]: end=false
              - navigation "End actions hidden" [ref=e890]:
                - generic:
                  - separator
                - img "Brand" [ref=e892]:
                  - img [ref=e894]:
                    - generic [ref=e895]: B
                - generic [ref=e896]:
                  - button "Home" [ref=e897] [cursor=pointer]:
                    - generic [ref=e900]: Home
                  - button "Products" [ref=e901] [cursor=pointer]:
                    - generic [ref=e904]: Products
                  - button "Solutions" [ref=e905] [cursor=pointer]:
                    - generic [ref=e908]: Solutions
                  - button "Resources" [ref=e909] [cursor=pointer]:
                    - generic [ref=e912]: Resources
                - generic [ref=e913]:
                  - search "Site search" [ref=e914]:
                    - generic [ref=e916]:
                      - img [ref=e919]
                      - searchbox "Search" [ref=e921]
                  - img "Jane Doe" [ref=e922]:
                    - img [ref=e924]
        - region "avatar=true / avatar=false" [ref=e926]:
          - heading "avatar=true / avatar=false" [level=3] [ref=e927]
          - generic [ref=e930]:
            - generic [ref=e931]:
              - paragraph [ref=e932]: avatar=true
              - navigation "Avatar visible" [ref=e936]:
                - generic:
                  - separator
                - img "Brand" [ref=e938]:
                  - img [ref=e940]:
                    - generic [ref=e941]: B
                - generic [ref=e942]:
                  - button "Home" [ref=e943] [cursor=pointer]:
                    - generic [ref=e946]: Home
                  - button "Products" [ref=e947] [cursor=pointer]:
                    - generic [ref=e950]: Products
                  - button "Solutions" [ref=e951] [cursor=pointer]:
                    - generic [ref=e954]: Solutions
                  - button "Resources" [ref=e955] [cursor=pointer]:
                    - generic [ref=e958]: Resources
                - generic [ref=e959]:
                  - search "Site search" [ref=e960]:
                    - generic [ref=e962]:
                      - img [ref=e965]
                      - searchbox "Search" [ref=e967]
                  - generic [ref=e968]:
                    - button "Ask HelloJio" [ref=e969] [cursor=pointer]:
                      - img [ref=e972]
                    - button "Notifications" [ref=e974] [cursor=pointer]:
                      - img [ref=e976]
                  - img "Jane Doe" [ref=e978]:
                    - img [ref=e980]
            - generic [ref=e982]:
              - paragraph [ref=e983]: avatar=false
              - navigation "Avatar hidden" [ref=e987]:
                - generic:
                  - separator
                - img "Brand" [ref=e989]:
                  - img [ref=e991]:
                    - generic [ref=e992]: B
                - generic [ref=e993]:
                  - button "Home" [ref=e994] [cursor=pointer]:
                    - generic [ref=e997]: Home
                  - button "Products" [ref=e998] [cursor=pointer]:
                    - generic [ref=e1001]: Products
                  - button "Solutions" [ref=e1002] [cursor=pointer]:
                    - generic [ref=e1005]: Solutions
                  - button "Resources" [ref=e1006] [cursor=pointer]:
                    - generic [ref=e1009]: Resources
                - generic [ref=e1010]:
                  - search "Site search" [ref=e1011]:
                    - generic [ref=e1013]:
                      - img [ref=e1016]
                      - searchbox "Search" [ref=e1018]
                  - generic [ref=e1019]:
                    - button "Ask HelloJio" [ref=e1020] [cursor=pointer]:
                      - img [ref=e1023]
                    - button "Notifications" [ref=e1025] [cursor=pointer]:
                      - img [ref=e1027]
        - region "EndActions — Button vs IconButton" [ref=e1029]:
          - heading "EndActions — Button vs IconButton" [level=3] [ref=e1030]
          - generic [ref=e1033]:
            - generic [ref=e1034]:
              - paragraph [ref=e1035]: "EndActions: IconButton cluster"
              - navigation "IconButton end actions" [ref=e1039]:
                - generic:
                  - separator
                - img "Brand" [ref=e1041]:
                  - img [ref=e1043]:
                    - generic [ref=e1044]: B
                - generic [ref=e1045]:
                  - button "Home" [ref=e1046] [cursor=pointer]:
                    - generic [ref=e1049]: Home
                  - button "Products" [ref=e1050] [cursor=pointer]:
                    - generic [ref=e1053]: Products
                  - button "Solutions" [ref=e1054] [cursor=pointer]:
                    - generic [ref=e1057]: Solutions
                  - button "Resources" [ref=e1058] [cursor=pointer]:
                    - generic [ref=e1061]: Resources
                - generic [ref=e1062]:
                  - search "Site search" [ref=e1063]:
                    - generic [ref=e1065]:
                      - img [ref=e1068]
                      - searchbox "Search" [ref=e1070]
                  - generic [ref=e1071]:
                    - button "Ask HelloJio" [ref=e1072] [cursor=pointer]:
                      - img [ref=e1075]
                    - button "Notifications" [ref=e1077] [cursor=pointer]:
                      - img [ref=e1079]
                  - img "Jane Doe" [ref=e1081]:
                    - img [ref=e1083]
            - generic [ref=e1085]:
              - paragraph [ref=e1086]: "EndActions: Button"
              - navigation "Button end action" [ref=e1090]:
                - generic:
                  - separator
                - img "Brand" [ref=e1092]:
                  - img [ref=e1094]:
                    - generic [ref=e1095]: B
                - generic [ref=e1096]:
                  - button "Home" [ref=e1097] [cursor=pointer]:
                    - generic [ref=e1100]: Home
                  - button "Products" [ref=e1101] [cursor=pointer]:
                    - generic [ref=e1104]: Products
                  - button "Solutions" [ref=e1105] [cursor=pointer]:
                    - generic [ref=e1108]: Solutions
                  - button "Resources" [ref=e1109] [cursor=pointer]:
                    - generic [ref=e1112]: Resources
                - generic [ref=e1113]:
                  - button "Sign in" [ref=e1115] [cursor=pointer]:
                    - generic [ref=e1116]: Sign in
                  - img "Jane Doe" [ref=e1117]:
                    - img [ref=e1119]
        - region "Header.Item slot" [ref=e1121]:
          - heading "Header.Item slot" [level=3] [ref=e1122]
          - navigation "Header.Item interactive nav" [ref=e1128]:
            - generic:
              - separator
            - img "Brand" [ref=e1130]:
              - img [ref=e1132]:
                - generic [ref=e1133]: B
            - generic [ref=e1134]:
              - button "Alpha" [ref=e1135] [cursor=pointer]:
                - generic [ref=e1138]: Alpha
              - button "Beta" [ref=e1139] [cursor=pointer]:
                - generic [ref=e1142]: Beta
              - button "Gamma" [ref=e1143] [cursor=pointer]:
                - generic [ref=e1146]: Gamma
            - generic [ref=e1147]:
              - search "Site search" [ref=e1148]:
                - generic [ref=e1150]:
                  - img [ref=e1153]
                  - searchbox "Search" [ref=e1155]
              - generic [ref=e1156]:
                - button "Ask HelloJio" [ref=e1157] [cursor=pointer]:
                  - img [ref=e1160]
                - button "Notifications" [ref=e1162] [cursor=pointer]:
                  - img [ref=e1164]
              - img "Jane Doe" [ref=e1166]:
                - img [ref=e1168]
        - region "Negative / edge cases" [ref=e1170]:
          - heading "Negative / edge cases" [level=3] [ref=e1171]
          - generic [ref=e1174]:
            - generic [ref=e1175]:
              - paragraph [ref=e1176]: primaryNavItems=true but empty children
              - navigation "Empty nav items" [ref=e1180]:
                - generic:
                  - separator
                - img "Brand" [ref=e1182]:
                  - img [ref=e1184]:
                    - generic [ref=e1185]: B
                - generic [ref=e1186]:
                  - search "Site search" [ref=e1187]:
                    - generic [ref=e1189]:
                      - img [ref=e1192]
                      - searchbox "Search" [ref=e1194]
                  - generic [ref=e1195]:
                    - button "Ask HelloJio" [ref=e1196] [cursor=pointer]:
                      - img [ref=e1199]
                    - button "Notifications" [ref=e1201] [cursor=pointer]:
                      - img [ref=e1203]
                  - img "Jane Doe" [ref=e1205]:
                    - img [ref=e1207]
            - generic [ref=e1209]:
              - paragraph [ref=e1210]: end=false + avatar=false
              - navigation "No end and no avatar" [ref=e1214]:
                - generic:
                  - separator
                - img "Brand" [ref=e1216]:
                  - img [ref=e1218]:
                    - generic [ref=e1219]: B
                - generic [ref=e1220]:
                  - button "Home" [ref=e1221] [cursor=pointer]:
                    - generic [ref=e1224]: Home
                  - button "Products" [ref=e1225] [cursor=pointer]:
                    - generic [ref=e1228]: Products
                  - button "Solutions" [ref=e1229] [cursor=pointer]:
                    - generic [ref=e1232]: Solutions
                  - button "Resources" [ref=e1233] [cursor=pointer]:
                    - generic [ref=e1236]: Resources
                  - search "Site search" [ref=e1237]:
                    - generic [ref=e1239]:
                      - img [ref=e1242]
                      - searchbox "Search" [ref=e1244]
            - generic [ref=e1245]:
              - paragraph [ref=e1246]: searchBar with searchInput=none (invalid combo)
              - navigation "SearchBar without search input" [ref=e1250]:
                - generic:
                  - separator
                - img "Brand" [ref=e1252]:
                  - img [ref=e1254]:
                    - generic [ref=e1255]: B
                - generic [ref=e1256]:
                  - generic [ref=e1257]:
                    - button "Ask HelloJio" [ref=e1258] [cursor=pointer]:
                      - img [ref=e1261]
                    - button "Notifications" [ref=e1263] [cursor=pointer]:
                      - img [ref=e1265]
                  - img "Jane Doe" [ref=e1267]:
                    - img [ref=e1269]
        - region "Responsive — Figma platform widths" [ref=e1271]:
          - heading "Responsive — Figma platform widths" [level=3] [ref=e1272]
          - generic [ref=e1273]:
            - paragraph [ref=e1274]:
              - text: Platforms
              - strong [ref=e1275]: "360"
              - text: ·
              - strong [ref=e1276]: "768"
              - text: ·
              - strong [ref=e1277]: "1024"
              - text: ·
              - strong [ref=e1278]: "1440"
              - text: ·
              - strong [ref=e1279]: "1920"
              - text: — fixed-width frames per Figma validation sheet.
            - generic [ref=e1281]:
              - generic [ref=e1282]:
                - paragraph [ref=e1283]: "platform: 360 (breakpoint S)"
                - navigation "WebHeader 360 — primary navigation" [ref=e1288]:
                  - generic:
                    - separator
                  - generic [ref=e1289]:
                    - button "Open navigation menu" [ref=e1291] [cursor=pointer]:
                      - img [ref=e1293]
                    - img "Brand" [ref=e1295]:
                      - img [ref=e1297]:
                        - generic [ref=e1298]: B
                  - generic [ref=e1299]:
                    - generic [ref=e1300]:
                      - button "Ask HelloJio" [ref=e1301] [cursor=pointer]:
                        - img [ref=e1304]
                      - button "Notifications" [ref=e1306] [cursor=pointer]:
                        - img [ref=e1308]
                    - img "Jane Doe" [ref=e1310]:
                      - img [ref=e1312]
              - generic [ref=e1314]:
                - paragraph [ref=e1315]: "platform: 768 (breakpoint M)"
                - navigation "WebHeader 768 — primary navigation" [ref=e1320]:
                  - generic:
                    - separator
                  - generic [ref=e1321]:
                    - button "Open navigation menu" [ref=e1323] [cursor=pointer]:
                      - img [ref=e1325]
                    - img "Brand" [ref=e1327]:
                      - img [ref=e1329]:
                        - generic [ref=e1330]: B
                  - generic [ref=e1331]:
                    - button "Home" [ref=e1332] [cursor=pointer]:
                      - generic [ref=e1335]: Home
                    - button "Products" [ref=e1336] [cursor=pointer]:
                      - generic [ref=e1339]: Products
                    - button "Solutions" [ref=e1340] [cursor=pointer]:
                      - generic [ref=e1343]: Solutions
                  - generic [ref=e1344]:
                    - generic [ref=e1345]:
                      - button "Ask HelloJio" [ref=e1346] [cursor=pointer]:
                        - img [ref=e1349]
                      - button "Notifications" [ref=e1351] [cursor=pointer]:
                        - img [ref=e1353]
                    - img "Jane Doe" [ref=e1355]:
                      - img [ref=e1357]
              - generic [ref=e1359]:
                - paragraph [ref=e1360]: "platform: 1024 (breakpoint L)"
                - navigation "WebHeader 1024 — primary navigation" [ref=e1365]:
                  - generic:
                    - separator
                  - img "Brand" [ref=e1367]:
                    - img [ref=e1369]:
                      - generic [ref=e1370]: B
                  - generic [ref=e1371]:
                    - button "Home" [ref=e1372] [cursor=pointer]:
                      - generic [ref=e1375]: Home
                    - button "Products" [ref=e1376] [cursor=pointer]:
                      - generic [ref=e1379]: Products
                    - button "Solutions" [ref=e1380] [cursor=pointer]:
                      - generic [ref=e1383]: Solutions
                  - generic [ref=e1384]:
                    - search "WebHeader 1024 — site search" [ref=e1385]:
                      - generic [ref=e1387]:
                        - img [ref=e1390]
                        - searchbox "Search" [ref=e1392]
                    - generic [ref=e1393]:
                      - button "Ask HelloJio" [ref=e1394] [cursor=pointer]:
                        - img [ref=e1397]
                      - button "Notifications" [ref=e1399] [cursor=pointer]:
                        - img [ref=e1401]
                    - img "Jane Doe" [ref=e1403]:
                      - img [ref=e1405]
              - generic [ref=e1407]:
                - paragraph [ref=e1408]: "platform: 1440 (breakpoint L)"
                - navigation "WebHeader 1440 — primary navigation" [ref=e1413]:
                  - generic:
                    - separator
                  - img "Brand" [ref=e1415]:
                    - img [ref=e1417]:
                      - generic [ref=e1418]: B
                  - generic [ref=e1419]:
                    - button "Home" [ref=e1420] [cursor=pointer]:
                      - generic [ref=e1423]: Home
                    - button "Products" [ref=e1424] [cursor=pointer]:
                      - generic [ref=e1427]: Products
                    - button "Solutions" [ref=e1428] [cursor=pointer]:
                      - generic [ref=e1431]: Solutions
                  - generic [ref=e1432]:
                    - search "WebHeader 1440 — site search" [ref=e1433]:
                      - generic [ref=e1435]:
                        - img [ref=e1438]
                        - searchbox "Search" [ref=e1440]
                    - generic [ref=e1441]:
                      - button "Ask HelloJio" [ref=e1442] [cursor=pointer]:
                        - img [ref=e1445]
                      - button "Notifications" [ref=e1447] [cursor=pointer]:
                        - img [ref=e1449]
                    - img "Jane Doe" [ref=e1451]:
                      - img [ref=e1453]
              - generic [ref=e1455]:
                - paragraph [ref=e1456]: "platform: 1920 (breakpoint L)"
                - navigation "WebHeader 1920 — primary navigation" [ref=e1461]:
                  - generic:
                    - separator
                  - img "Brand" [ref=e1463]:
                    - img [ref=e1465]:
                      - generic [ref=e1466]: B
                  - generic [ref=e1467]:
                    - button "Home" [ref=e1468] [cursor=pointer]:
                      - generic [ref=e1471]: Home
                    - button "Products" [ref=e1472] [cursor=pointer]:
                      - generic [ref=e1475]: Products
                    - button "Solutions" [ref=e1476] [cursor=pointer]:
                      - generic [ref=e1479]: Solutions
                  - generic [ref=e1480]:
                    - search "WebHeader 1920 — site search" [ref=e1481]:
                      - generic [ref=e1483]:
                        - img [ref=e1486]
                        - searchbox "Search" [ref=e1488]
                    - generic [ref=e1489]:
                      - button "Ask HelloJio" [ref=e1490] [cursor=pointer]:
                        - img [ref=e1493]
                      - button "Notifications" [ref=e1495] [cursor=pointer]:
                        - img [ref=e1497]
                    - img "Jane Doe" [ref=e1499]:
                      - img [ref=e1501]
```

# Test source

```ts
  1  | import { expect, type Locator, type Page } from 'playwright/test';
  2  | 
  3  | /** `data-testid` wraps each `WebHeader` mount in `WebHeaderQaShowcase.tsx`. */
  4  | export function webHeaderByTestId(page: Page, testId: string): Locator {
  5  |   return page.getByTestId(testId);
  6  | }
  7  | 
  8  | export function primaryNavInMount(mount: Locator): Locator {
  9  |   return mount.getByRole('navigation', { name: /primary navigation/i });
  10 | }
  11 | 
  12 | export function searchInMount(mount: Locator): Locator {
  13 |   return mount.getByRole('search');
  14 | }
  15 | 
  16 | export function searchboxInMount(mount: Locator): Locator {
  17 |   return mount.getByRole('searchbox');
  18 | }
  19 | 
  20 | export async function scrollToSection(page: Page, sectionId: string): Promise<void> {
  21 |   await page.locator(`[data-section="${sectionId}"]`).scrollIntoViewIfNeeded();
  22 | }
  23 | 
  24 | export async function expectNavItemVisible(mount: Locator, name: string): Promise<void> {
  25 |   await expect(mount.getByRole('button', { name })).toBeVisible();
  26 | }
  27 | 
  28 | export async function expectNavItemHidden(mount: Locator, name: string): Promise<void> {
  29 |   await expect(mount.getByRole('button', { name })).toHaveCount(0);
  30 | }
  31 | 
  32 | export async function clickNavItem(mount: Locator, name: string): Promise<void> {
  33 |   await mount.getByRole('button', { name }).click();
  34 | }
  35 | 
  36 | export async function expectActiveNavItem(mount: Locator, name: string): Promise<void> {
  37 |   await expect(mount.getByRole('button', { name })).toHaveAttribute('data-active', 'true');
  38 | }
  39 | 
  40 | export async function expectNoErrorText(locator: Locator): Promise<void> {
  41 |   await expect(locator).not.toContainText(/error|failed|exception/i);
  42 | }
  43 | 
  44 | export async function expectFocusRingVisible(page: Page): Promise<void> {
  45 |   const focusStyle = await page.evaluate(() => {
  46 |     const el = document.activeElement;
  47 |     if (!el) return null;
  48 |     const style = getComputedStyle(el);
  49 |     return { outlineWidth: style.outlineWidth, boxShadow: style.boxShadow };
  50 |   });
  51 |   const hasVisibleFocus =
  52 |     focusStyle?.outlineWidth !== '0px' ||
  53 |     (focusStyle?.boxShadow != null && focusStyle.boxShadow !== 'none');
  54 |   expect(hasVisibleFocus, 'Focused control should show outline or box-shadow').toBe(true);
  55 | }
  56 | 
  57 | export async function expectAvatarVisible(mount: Locator): Promise<void> {
> 58 |   await expect(mount.locator('[data-oneui-component="Avatar"]')).toBeVisible();
     |                                                                  ^ Error: expect(locator).toBeVisible() failed
  59 | }
  60 | 
  61 | export async function expectAvatarHidden(mount: Locator): Promise<void> {
  62 |   await expect(mount.locator('[data-oneui-component="Avatar"]')).toHaveCount(0);
  63 | }
  64 | 
  65 | export async function expectEndIconButtonsVisible(mount: Locator): Promise<void> {
  66 |   await expect(mount.getByRole('button', { name: 'Ask HelloJio' })).toBeVisible();
  67 | }
  68 | 
  69 | export async function expectEndButtonVisible(mount: Locator, name: string): Promise<void> {
  70 |   await expect(mount.getByRole('button', { name })).toBeVisible();
  71 | }
  72 | 
  73 | export async function expectMenuButtonVisible(mount: Locator): Promise<void> {
  74 |   await expect(mount.getByRole('button', { name: 'Open navigation menu' })).toBeVisible();
  75 | }
  76 | 
  77 | export async function expectMenuButtonHidden(mount: Locator): Promise<void> {
  78 |   await expect(mount.getByRole('button', { name: 'Open navigation menu' })).toHaveCount(0);
  79 | }
  80 | 
  81 | export async function expectLogoVisible(mount: Locator): Promise<void> {
  82 |   await expect(mount.locator('[data-oneui-component="Logo"]')).toBeVisible();
  83 | }
  84 | 
  85 | export async function expectLogoHidden(mount: Locator): Promise<void> {
  86 |   await expect(mount.locator('[data-oneui-component="Logo"]')).toHaveCount(0);
  87 | }
  88 | 
  89 | export async function expectPrimaryNavType(mount: Locator, type: string): Promise<void> {
  90 |   await expect(mount.locator('nav[data-type]')).toHaveAttribute('data-type', type);
  91 | }
  92 | 
  93 | export async function expectPrimaryNavMiddle(mount: Locator, middle: string): Promise<void> {
  94 |   await expect(mount.locator('nav[data-middle]')).toHaveAttribute('data-middle', middle);
  95 | }
  96 | 
```