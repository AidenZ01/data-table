import "./App.css";
import propsData from "./data/props.json";
import altData from "./data/alternates.json";
import { useState } from "react";

function App() {
  const [data, setData] = useState(
    propsData.map((d, i) => ({ dataId: i, ...d }))
  );
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("ASC");

  // calculate each market's suspension status using props.json and alternates.json
  const getSuspended = (d) => {
    let suspended = false;
    let matching = false;
    if (d.marketSuspended === 1) {
      return "Suspended";
    }
    altData.forEach((altD) => {
      if (d.playerId === altD.playerId && d.statType === altD.statType) {
        if (
          altD.underOdds < 0.4 &&
          altD.overOdds < 0.4 &&
          altD.pushOdds < 0.4
        ) {
          suspended = true;
        }
        if (d.line === altD.line) {
          matching = true;
        }
      }
    });
    if (!matching) {
      suspended = true;
    }

    return suspended ? "Suspended" : "Released";
  };

  // this returns a new data object that has "suspended" key in there
  // so we can pass that to the sorting function
  for (let i = 0; i < propsData.length; i++) {
    propsData[i].suspended = getSuspended(propsData[i]);
  }

  // used for input filter functionality
  const keys = ["playerName", "teamAbbr"];
  const filterData = (d1) => {
    return d1.filter((d2) =>
      keys.some((key) => d2[key].toLowerCase().includes(search))
    );
  };
  const filterableData = filterData(data);

  // used for sorting the columns
  const sorting = (col) => {
    if (order === "ASC") {
      const sorted = [...data].sort((a, b) =>
        a[col].toLowerCase() > b[col].toLowerCase() ? 1 : -1
      );
      setData(sorted);
      setOrder("DSC");
    }
    if (order === "DSC") {
      const sorted = [...data].sort((a, b) =>
        a[col].toLowerCase() < b[col].toLowerCase() ? 1 : -1
      );
      setData(sorted);
      setOrder("ASC");
    }
  };

  const handleKeyDown = (e, str) => {
    if (e.keyCode === 13) {
      sorting(str);
    }
  };

  // this function returns the highest line
  const getHighest = (id, statType) => {
    let highest = -1;
    altData.forEach((altD) => {
      if (altD.playerId === id && altD.statType === statType) {
        if (altD.line > highest) {
          highest = altD.line;
        }
      }
    });
    return highest === -1 ? "N/A" : highest;
  };

  // this function returns the lowest line
  const getLowest = (id, statType) => {
    let lowest = 1000000;
    altData.forEach((altD) => {
      if (altD.playerId === id && altD.statType === statType) {
        if (altD.line < lowest) {
          lowest = altD.line;
        }
      }
    });
    return lowest === 1000000 ? "N/A" : lowest;
  };

  // since the original data do not have an unique ID in each object
  // we need to add the ID to the data (please check line 8)
  // so we can change the market status for a specific market
  const changeStatus = (e) => {
    const dataId = Number(e.target.id.replace("btn-change-", ""));
    setData((prevData) => {
      const newData = [];
      for (const pd of prevData) {
        if (pd.dataId === dataId) {
          newData.push({
            ...pd,
            suspended: pd.suspended === "Suspended" ? "Released" : "Suspended",
          });
        } else {
          newData.push(pd);
        }
      }
      return newData;
    });
  };

  return (
    <div className="app-container">
      <table>
        <thead>
          <tr>
            <th>
              Name
              <input
                type="text"
                placeholder="Name/Team"
                onChange={(e) => setSearch(e.target.value)}
              />
            </th>
            <th>Team</th>
            <th
              tabIndex="0"
              onClick={() => sorting("statType")}
              onKeyDown={(e) => handleKeyDown(e, "statType")}
            >
              Stat
            </th>
            <th>High</th>
            <th>Low</th>
            <th
              tabIndex="0"
              onClick={() => sorting("position")}
              onKeyDown={(e) => handleKeyDown(e, "position")}
            >
              Position
            </th>
            <th
              tabIndex="0"
              onClick={() => sorting("suspended")}
              onKeyDown={(e) => handleKeyDown(e, "suspended")}
            >
              Market Status
            </th>
          </tr>
        </thead>
        <tbody>
          {filterableData.map((fd) => (
            <tr key={fd.dataId}>
              <td>{fd.playerName}</td>
              <td>{fd.teamAbbr}</td>
              <td>{fd.statType}</td>
              <td>{getHighest(fd.playerId, fd.statType)}</td>
              <td>{getLowest(fd.playerId, fd.statType)}</td>
              <td>{fd.position}</td>
              <td>
                {fd.suspended}
                <button id={`btn-change-${fd.dataId}`} onClick={changeStatus}>
                  change status
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
