package gae;
import javax.jdo.JDOHelper;
import javax.jdo.PersistenceManagerFactory;


public class PersManFact {

	private static final PersistenceManagerFactory perInstance =
		JDOHelper.getPersistenceManagerFactory("transactions-optional");

	public PersManFact() {
		// TODO 自動生成されたコンストラクター・スタブ
	}

	public static PersistenceManagerFactory get() {
		return perInstance;
	}

}