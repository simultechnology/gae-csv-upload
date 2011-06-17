package gae;

import gae.Dictionary;
import gae.PersManFact;

import java.io.IOException;
import java.util.List;

import javax.jdo.PersistenceManager;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.*;


@SuppressWarnings("serial")
public class SelectServlet extends HttpServlet {
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		PersistenceManager pm = null;;
		// 更新日付が新しい順に上から表示する
		String query = "select from " + Dictionary.class.getName() + " order by updateTime desc";

		if (pm == null) {
		pm = PersManFact.get().getPersistenceManager();
		}

		List<Dictionary> dictionaries = (List<Dictionary>) pm.newQuery(query).execute();

		req.setAttribute("dictionaries", dictionaries);

		RequestDispatcher rd = req
		.getRequestDispatcher("/result.jsp");

		try {
			rd.forward(req, resp);
		} catch (ServletException e) {
			// TODO 自動生成された catch ブロック
			e.printStackTrace();
		}
	}
}